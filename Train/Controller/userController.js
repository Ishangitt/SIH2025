const User = require('../Models/UserModel');

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await User.create({ name, email, password, role });
    res.status(201).json({ success: true, user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password" });
    }
    
    const user = await User.findOne({ email: email });

    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // JWT token generation should be implemented here
    const token = "JWT_TOKEN_PLACEHOLDER";
    
    res.status(200).json({ success: true, message: 'Login successful', role: user.role, token });
  } catch (error) {
     res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { registerUser, loginUser };