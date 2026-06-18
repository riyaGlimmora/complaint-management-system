// tests/unit/assignmentService.test.js
jest.mock('../../src/models/productModel');
jest.mock('../../src/models/ticketModel');
jest.mock('../../src/models/teamModel');
jest.mock('../../src/models/ticketHistoryModel');

const productModel = require('../../src/models/productModel');
const ticketModel = require('../../src/models/ticketModel');
const teamModel = require('../../src/models/teamModel');
const ticketHistoryModel = require('../../src/models/ticketHistoryModel');
const assignmentService = require('../../src/services/assignmentService');

describe('assignmentService.autoAssign', () => {
  beforeEach(() => jest.clearAllMocks());

  test('assigns to the least-loaded staff member in the product\'s team', async () => {
    const ticket = { id: 'tic-1', product_id: 'prod-1' };
    productModel.findById.mockResolvedValue({ id: 'prod-1', team_id: 'team-1' });
    ticketModel.countActiveTicketsByStaff.mockResolvedValue([
      { staff_id: 'staff-light', active_count: '1' },
      { staff_id: 'staff-busy', active_count: '5' },
    ]);
    ticketModel.assign.mockResolvedValue({ ...ticket, assigned_staff_id: 'staff-light' });
    ticketHistoryModel.log.mockResolvedValue({});

    const result = await assignmentService.autoAssign(ticket);

    expect(ticketModel.assign).toHaveBeenCalledWith('tic-1', {
      teamId: 'team-1',
      staffId: 'staff-light',
    });
    expect(result.assigned_staff_id).toBe('staff-light');
  });

  test('falls back to the team lead when no active staff exist', async () => {
    const ticket = { id: 'tic-2', product_id: 'prod-2' };
    productModel.findById.mockResolvedValue({ id: 'prod-2', team_id: 'team-2' });
    ticketModel.countActiveTicketsByStaff.mockResolvedValue([]);
    teamModel.findById.mockResolvedValue({ id: 'team-2', lead_id: 'lead-1' });
    ticketModel.assign.mockResolvedValue({ ...ticket, assigned_staff_id: 'lead-1' });
    ticketHistoryModel.log.mockResolvedValue({});

    const result = await assignmentService.autoAssign(ticket);

    expect(ticketModel.assign).toHaveBeenCalledWith('tic-2', {
      teamId: 'team-2',
      staffId: 'lead-1',
    });
    expect(result.assigned_staff_id).toBe('lead-1');
  });

  test('leaves ticket unassigned and logs it when the product has no mapped team', async () => {
    const ticket = { id: 'tic-3', product_id: 'prod-3' };
    productModel.findById.mockResolvedValue({ id: 'prod-3', team_id: null });
    ticketHistoryModel.log.mockResolvedValue({});

    const result = await assignmentService.autoAssign(ticket);

    expect(ticketModel.assign).not.toHaveBeenCalled();
    expect(ticketHistoryModel.log).toHaveBeenCalledWith(
      expect.objectContaining({ newValue: 'unassigned' })
    );
    expect(result).toBe(ticket);
  });
});
