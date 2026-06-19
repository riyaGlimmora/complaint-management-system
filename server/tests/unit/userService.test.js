// tests/unit/userService.test.js
jest.mock('../../src/models/userModel');
jest.mock('../../src/models/teamModel');

const userModel = require('../../src/models/userModel');
const teamModel = require('../../src/models/teamModel');
const userService = require('../../src/services/userService');

describe('userService.createStaffUser', () => {
  beforeEach(() => jest.clearAllMocks());

  test('rejects a duplicate email', async () => {
    userModel.findByEmail.mockResolvedValue({ id: 'existing' });

    await expect(
      userService.createStaffUser({
        name: 'A',
        email: 'taken@test.com',
        password: 'Password123',
        role: 'staff',
        teamId: 'team-1',
      })
    ).rejects.toMatchObject({ statusCode: 409 });

    expect(teamModel.findById).not.toHaveBeenCalled();
  });

  test('rejects a staff account with a non-existent team', async () => {
    userModel.findByEmail.mockResolvedValue(null);
    teamModel.findById.mockResolvedValue(null);

    await expect(
      userService.createStaffUser({
        name: 'A',
        email: 'a@test.com',
        password: 'Password123',
        role: 'staff',
        teamId: 'bad-team',
      })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test('creates an admin account without requiring a team', async () => {
    userModel.findByEmail.mockResolvedValue(null);
    userModel.getRoleIdByName.mockResolvedValue('role-admin');
    userModel.createWithTeam.mockResolvedValue({
      id: 'u1',
      name: 'New Admin',
      email: 'admin2@test.com',
      team_id: null,
    });

    const result = await userService.createStaffUser({
      name: 'New Admin',
      email: 'admin2@test.com',
      password: 'Password123',
      role: 'admin',
      teamId: null,
    });

    expect(teamModel.findById).not.toHaveBeenCalled();
    expect(userModel.createWithTeam).toHaveBeenCalledWith(
      expect.objectContaining({ teamId: null })
    );
    expect(result.role).toBe('admin');
  });

  test('creates a staff account scoped to a valid team', async () => {
    userModel.findByEmail.mockResolvedValue(null);
    teamModel.findById.mockResolvedValue({ id: 'team-1', name: 'Hardware Support' });
    userModel.getRoleIdByName.mockResolvedValue('role-staff');
    userModel.createWithTeam.mockResolvedValue({
      id: 'u2',
      name: 'Staff One',
      email: 'staff1@test.com',
      team_id: 'team-1',
    });

    const result = await userService.createStaffUser({
      name: 'Staff One',
      email: 'staff1@test.com',
      password: 'Password123',
      role: 'staff',
      teamId: 'team-1',
    });

    expect(userModel.createWithTeam).toHaveBeenCalledWith(
      expect.objectContaining({ teamId: 'team-1' })
    );
    expect(result.teamId).toBe('team-1');
  });
});
