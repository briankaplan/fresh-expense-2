import { User } from "@fresh-expense/types";
import * as argon2 from "argon2";
import { Router } from "express";

import { generateToken } from "@/core/utils/auth";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await argon2.hash(password);
    const user = new User({ email, password: hashedPassword, name });
    await user.save();

    const token = generateToken(user);
    res.status(201).json({ token, user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ message: "Error registering user" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await argon2.verify(user.password, password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);
    res.json({ token, user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ message: "Error logging in" });
  }
});

export default router;
