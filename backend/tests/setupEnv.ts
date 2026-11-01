// Runs before every test file. Modules like jwtUtil read these when they load.
process.env.JWT_SECRET = "test-jwt-secret";