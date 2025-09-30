import { checkAuthentication } from "../../middleware/auth";

describe("checkAuthentication", () => {
  let res: any;
  let next: any;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => jest.clearAllMocks());

  it("calls next when authenticated", () => {
    const req = {
      isAuthenticated: () => true,
    } as any;

    checkAuthentication(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("returns 401 when unauthenticated", () => {
    const req = {
      isAuthenticated: () => false,
    } as any;

    checkAuthentication(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Unauthorized - Please log in",
    });
    expect(next).not.toHaveBeenCalled();
  });
});
