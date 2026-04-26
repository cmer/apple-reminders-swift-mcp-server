import { execSync } from 'child_process';
import { chmodSync, constants, existsSync, readdirSync, statSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MCPError, MCPErrorCode, mapSwiftErrorCode, SwiftCLIError } from '../types/error.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Resolve the Swift CLI binary path.
 *
 * Some install/packaging flows (e.g. Claude Desktop's extension installer) strip
 * the `.build/release` symlink that `swift build` creates, and may also drop the
 * binary's exec bit. Fall back to the architecture-specific output dir and
 * restore exec permissions so the executor keeps working without a rebuild.
 */
function resolveCliPath(defaultPath: string): string {
  const candidates: string[] = [defaultPath];

  if (!existsSync(defaultPath)) {
    const buildDir = path.dirname(path.dirname(defaultPath));
    if (existsSync(buildDir)) {
      for (const entry of readdirSync(buildDir)) {
        const candidate = path.join(buildDir, entry, 'release', 'reminders-cli');
        if (existsSync(candidate)) candidates.push(candidate);
      }
    }
  }

  const resolved = candidates.find((p) => existsSync(p)) ?? defaultPath;

  if (existsSync(resolved)) {
    const mode = statSync(resolved).mode;
    if (!(mode & constants.S_IXUSR)) {
      try {
        chmodSync(resolved, mode | constants.S_IXUSR | constants.S_IXGRP | constants.S_IXOTH);
      } catch {
        // best-effort; execSync will surface a clearer error if it still can't run
      }
    }
  }

  return resolved;
}

/**
 * Swift CLI response structure
 */
export interface SwiftCLIResponse<T> {
  success: boolean;
  data?: T;
  error?: SwiftCLIError;
}

/**
 * Options for Swift executor
 */
export interface SwiftExecutorOptions {
  cliPath?: string;
  timeout?: number;
}

/**
 * Executes Swift CLI commands and handles responses
 */
export class SwiftExecutor {
  private cliPath: string;
  private timeout: number;

  constructor(options: SwiftExecutorOptions = {}) {
    const defaultPath =
      options.cliPath || path.join(__dirname, '../../swift-cli/.build/release/reminders-cli');
    this.cliPath = resolveCliPath(defaultPath);
    this.timeout = options.timeout || 30000; // 30 seconds default
  }

  /**
   * Execute a Swift CLI command
   */
  async execute<T>(command: string, args: unknown = {}): Promise<T> {
    const jsonInput = JSON.stringify(args);

    try {
      const result = execSync(`"${this.cliPath}" ${command} '${jsonInput}'`, {
        encoding: 'utf-8',
        timeout: this.timeout,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      const response = JSON.parse(result) as SwiftCLIResponse<T>;

      if (!response.success || response.error) {
        throw this.createMCPError(response.error);
      }

      if (!response.data) {
        throw new MCPError(MCPErrorCode.INTERNAL_ERROR, 'Swift CLI returned success but no data');
      }

      return response.data;
    } catch (error) {
      // Handle execution errors
      if (error instanceof MCPError) {
        throw error;
      }

      if (error && typeof error === 'object' && 'stderr' in error) {
        const stderr = (error as { stderr: Buffer | string }).stderr.toString();
        try {
          // Try to parse error JSON from stderr
          const errorResponse = JSON.parse(stderr) as SwiftCLIResponse<T>;
          if (errorResponse.error) {
            throw this.createMCPError(errorResponse.error);
          }
        } catch (parseError) {
          // If we can't parse stderr, throw a generic error
          throw new MCPError(
            MCPErrorCode.SWIFT_CLI_EXECUTION_FAILED,
            `Swift CLI execution failed: ${stderr}`,
            { stderr }
          );
        }
      }

      // Generic error
      throw new MCPError(
        MCPErrorCode.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Unknown error',
        { originalError: error }
      );
    }
  }

  /**
   * Request access to reminders (must be called first)
   */
  async requestAccess(): Promise<{ granted: boolean; message: string }> {
    try {
      const result = execSync(`"${this.cliPath}" request-access`, {
        encoding: 'utf-8',
        timeout: this.timeout,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      return JSON.parse(result);
    } catch (error) {
      throw new MCPError(MCPErrorCode.PERMISSION_DENIED, 'Failed to request access to reminders', {
        originalError: error,
      });
    }
  }

  /**
   * Create MCPError from Swift CLI error
   */
  private createMCPError(swiftError?: SwiftCLIError): MCPError {
    if (!swiftError) {
      return new MCPError(MCPErrorCode.INTERNAL_ERROR, 'Unknown error from Swift CLI');
    }

    const mcpErrorCode = mapSwiftErrorCode(swiftError.code);
    return new MCPError(mcpErrorCode, swiftError.message, {
      swiftCode: swiftError.code,
      swiftDetails: swiftError.details,
    });
  }
}
