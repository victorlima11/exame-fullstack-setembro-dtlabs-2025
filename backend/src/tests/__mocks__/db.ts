export const db = {
  connect: jest.fn().mockResolvedValue(true),
  query: jest.fn(),
};
