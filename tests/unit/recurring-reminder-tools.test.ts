import { describe, expect, it, vi } from 'vitest';
import { createReminderHandler, createReminderTool } from '../../src/tools/reminders/create-reminder.js';
import { getReminderHandler, getReminderTool } from '../../src/tools/reminders/get-reminder.js';
import { getRemindersListHandler } from '../../src/tools/reminders/get-reminders.js';
import {
  getCompletedRemindersHandler,
  getOverdueRemindersHandler,
  getTodaysRemindersHandler,
} from '../../src/tools/search/date-based-reminders.js';
import { searchRemindersHandler } from '../../src/tools/search/search-reminders.js';
import { createServer } from '../../src/server.js';
import type { SwiftExecutor } from '../../src/executor/swift-executor.js';
import type { RecurrenceRule, Reminder } from '../../src/types/reminder.js';

const DUE = '2026-10-19T14:30:00.000Z';
const RULE: RecurrenceRule = {
  frequency: 'weekly',
  interval: 2,
  daysOfWeek: ['monday', 'wednesday'],
};
const LINE = '🔁 Every 2 weeks on Mon, Wed';

function reminder(overrides: Partial<Reminder>): Reminder {
  return {
    id: 'ID-1',
    title: 'Gym',
    isCompleted: false,
    priority: 0,
    listId: 'list-1',
    listName: 'Personal',
    flagged: false,
    hasAlarms: false,
    hasRecurrenceRules: false,
    recurrence: null,
    dueDateHasTime: false,
    ...overrides,
  };
}

const recurring = reminder({
  dueDate: DUE,
  dueDateHasTime: true,
  hasRecurrenceRules: true,
  recurrence: RULE,
});

function executorReturning(value: unknown) {
  const execute = vi.fn().mockResolvedValue(value);
  return { executor: { execute } as unknown as SwiftExecutor, execute };
}

const textOf = (result: { content: Array<{ text: string }> }) => result.content[0].text;

describe('create_reminder with recurrence', () => {
  it('advertises recurrence with a description for every field', () => {
    const props = createReminderTool.inputSchema.properties as Record<string, any>;
    const recurrence = props.recurrence;
    expect(recurrence.type).toBe('object');
    expect(recurrence.required).toEqual(['frequency']);
    expect(Object.keys(recurrence.properties)).toEqual(['frequency', 'interval', 'daysOfWeek']);
    for (const field of Object.values<any>(recurrence.properties)) {
      expect(field.description).toBeTruthy();
    }
    expect(recurrence.properties.frequency.enum).toEqual(['daily', 'weekly', 'monthly', 'yearly']);
    expect(recurrence.properties.daysOfWeek.items.enum).toEqual([
      'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
    ]);
    expect(recurrence.properties.interval.minimum).toBe(1);
  });

  it('passes the rule to the CLI and shows the summary line', async () => {
    const { executor, execute } = executorReturning(recurring);
    const result = await createReminderHandler(
      { title: 'Gym', dueDate: DUE, recurrence: RULE },
      executor
    );
    expect(execute).toHaveBeenCalledWith(
      'create-reminder',
      expect.objectContaining({ title: 'Gym', dueDate: DUE, recurrence: RULE })
    );
    expect(textOf(result)).toContain(LINE);
  });

  it('defaults interval to 1 in the payload', async () => {
    const { executor, execute } = executorReturning(recurring);
    await createReminderHandler(
      { title: 'Gym', dueDate: DUE, recurrence: { frequency: 'daily' } },
      executor
    );
    expect(execute.mock.calls[0][1].recurrence).toEqual({ frequency: 'daily', interval: 1 });
  });

  it('rejects a rule without a due date before calling the CLI', async () => {
    const { executor, execute } = executorReturning(recurring);
    await expect(
      createReminderHandler({ title: 'Gym', recurrence: RULE }, executor)
    ).rejects.toThrow(
      'A recurring reminder needs a due date: pass dueDate as the first occurrence.'
    );
    expect(execute).not.toHaveBeenCalled();
  });

  it('has no recurrence line for a one-off reminder', async () => {
    const { executor } = executorReturning(reminder({ dueDate: DUE }));
    const result = await createReminderHandler({ title: 'Gym', dueDate: DUE }, executor);
    expect(textOf(result)).not.toContain('🔁');
  });
});

describe('get_reminder', () => {
  it('is registered as the sixteenth tool', async () => {
    expect(getReminderTool.name).toBe('get_reminder');
    expect(getReminderTool.inputSchema.required).toEqual(['id']);
    const server = createServer({} as SwiftExecutor) as unknown as {
      _requestHandlers: Map<string, (req: unknown) => Promise<{ tools: Array<{ name: string }> }>>;
    };
    const list = server._requestHandlers.get('tools/list')!;
    const { tools } = await list({ method: 'tools/list' });
    expect(tools).toHaveLength(16);
    expect(tools.map((t) => t.name)).toContain('get_reminder');
  });

  it('shows full detail, the summary line and the rule as JSON', async () => {
    const { executor, execute } = executorReturning(
      reminder({
        id: 'ID-9',
        dueDate: DUE,
        dueDateHasTime: true,
        hasRecurrenceRules: true,
        recurrence: RULE,
        notes: 'Leg day',
        url: 'https://example.com/gym',
        priority: 1,
      })
    );
    const result = await getReminderHandler({ id: 'ID-9' }, executor);
    expect(execute).toHaveBeenCalledWith('get-reminder', { id: 'ID-9' });
    const text = textOf(result);
    expect(text).toContain('Gym');
    expect(text).toContain('List: Personal');
    expect(text).toContain('ID: ID-9');
    expect(text).toContain(`Due: ${new Date(DUE).toLocaleString()}`);
    expect(text).toContain('Priority: High (Urgent !!!)');
    expect(text).toContain('URL: https://example.com/gym');
    expect(text).toContain('Leg day');
    expect(text).toContain(LINE);
    expect(text).toContain(`Recurrence rule:\n${JSON.stringify(RULE, null, 2)}`);
  });

  it('shows only the date for a date-only due date', async () => {
    const { executor } = executorReturning(reminder({ dueDate: DUE, dueDateHasTime: false }));
    const text = textOf(await getReminderHandler({ id: 'ID-1' }, executor));
    expect(text).toContain(`Due: ${new Date(DUE).toLocaleDateString()}`);
    expect(text).not.toContain(new Date(DUE).toLocaleTimeString());
  });

  it('leaves out the recurrence parts for a one-off reminder', async () => {
    const { executor } = executorReturning(reminder({ dueDate: DUE }));
    const text = textOf(await getReminderHandler({ id: 'ID-1' }, executor));
    expect(text).not.toContain('🔁');
    expect(text).not.toContain('Recurrence rule');
  });

  it('rejects a missing id', async () => {
    const { executor } = executorReturning(reminder({}));
    await expect(getReminderHandler({}, executor)).rejects.toThrow();
  });
});

describe('list tools show the recurrence line', () => {
  const plain = reminder({ id: 'P', title: 'Milk' });
  const cases: Array<[string, (e: SwiftExecutor) => Promise<{ content: Array<{ text: string }> }>]> = [
    ['get_reminders', (e) => getRemindersListHandler({}, e)],
    ['get_todays_reminders', (e) => getTodaysRemindersHandler({}, e)],
    ['get_overdue_reminders', (e) => getOverdueRemindersHandler({}, e)],
    ['get_completed_reminders', (e) => getCompletedRemindersHandler({}, e)],
    ['search_reminders', (e) => searchRemindersHandler({ searchText: 'x' }, e)],
  ];

  it.each(cases)('%s', async (_name, run) => {
    const { executor } = executorReturning([recurring, plain]);
    const text = textOf(await run(executor));
    expect(text.match(/🔁/g)).toHaveLength(1);
    expect(text).toContain(`\n   ${LINE}`);
    expect(text.indexOf('🔁')).toBeLessThan(text.indexOf('Milk'));
  });

  it('puts the line directly under the first line in get_reminders', async () => {
    const { executor } = executorReturning([recurring]);
    const text = textOf(await getRemindersListHandler({}, executor));
    expect(text).toContain(`\n   ${LINE}\n   List: Personal | ID: ID-1`);
  });
});
