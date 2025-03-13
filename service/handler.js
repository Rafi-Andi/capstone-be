export const handlerLogin = async (request, h) => {
  try {
    const { username, password } = request.payload;

    // Query user berdasarkan username
    const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    // Perbaikan pengecekan jika user tidak ditemukan
    if (rows.length === 0) {
      return h
        .response({ error: "Username atau password tidak ditemukan" })
        .code(404);
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    // Jika password salah
    if (!isMatch) {
      return h.response({ error: "Username atau password salah" }).code(401);
    }

    // Jika password benar, buat token
    const objekToken = {
      id: user.id,
      username: user.username,
    };
    const token = generateToken(objekToken);

    return h.response({ token }).code(200);
  } catch (err) {
    console.error("Login Error:", err);
    return h.response({ error: "Gagal login", detail: err.message }).code(500);
  }
};
