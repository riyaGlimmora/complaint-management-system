// tests/unit/ticketTransitions.test.js
// Tests the ALLOWED_TRANSITIONS state machine in isolation by re-deriving it
// from ticketService's exported behavior via changeStatus, with the model
// layer mocked out - no real database needed for this test.

jest.mock('../../src/models/ticketModel');
jest.mock('../../src/models/ticketHistoryModel');
jest.mock('../../src/models/productModel');
jest.mock('../../src/services/assignmentService');

const ticketModel = require('../../src/models/ticketModel');
const ticketHistoryModel = require('../../src/models/ticketHistoryModel');
const ticketService = require('../../src/services/ticketService');

function makeTicket(status) {
  return { id: 'ticket-1', status, customer_id: 'cust-1' };
}

describe('ticketService.changeStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ticketHistoryModel.log.mockResolvedValue({});
  });

  test('allows open -> in_progress', async () => {
    ticketModel.findById.mockResolvedValue(makeTicket('open'));
    ticketModel.updateStatus.mockResolvedValue(makeTicket('in_progress'));

    const result = await ticketService.changeStatus('ticket-1', 'in_progress', 'actor-1', '');

    expect(result.status).toBe('in_progress');
    expect(ticketModel.updateStatus).toHaveBeenCalledWith('ticket-1', 'in_progress');
    expect(ticketHistoryModel.log).toHaveBeenCalledTimes(1);
  });

  test('rejects open -> resolved (must pass through in_progress)', async () => {
    ticketModel.findById.mockResolvedValue(makeTicket('open'));

    await expect(
      ticketService.changeStatus('ticket-1', 'resolved', 'actor-1', '')
    ).rejects.toMatchObject({ statusCode: 400, code: 'INVALID_TRANSITION' });

    expect(ticketModel.updateStatus).not.toHaveBeenCalled();
  });

  test('rejects any transition out of closed', async () => {
    ticketModel.findById.mockResolvedValue(makeTicket('closed'));

    await expect(
      ticketService.changeStatus('ticket-1', 'open', 'actor-1', '')
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test('is idempotent when the new status equals the current status', async () => {
    const ticket = makeTicket('in_progress');
    ticketModel.findById.mockResolvedValue(ticket);

    const result = await ticketService.changeStatus('ticket-1', 'in_progress', 'actor-1', '');

    expect(result).toBe(ticket);
    expect(ticketModel.updateStatus).not.toHaveBeenCalled();
    expect(ticketHistoryModel.log).not.toHaveBeenCalled();
  });

  test('allows resolved -> reopened', async () => {
    ticketModel.findById.mockResolvedValue(makeTicket('resolved'));
    ticketModel.updateStatus.mockResolvedValue(makeTicket('reopened'));

    const result = await ticketService.changeStatus('ticket-1', 'reopened', 'actor-1', '');
    expect(result.status).toBe('reopened');
  });
});
