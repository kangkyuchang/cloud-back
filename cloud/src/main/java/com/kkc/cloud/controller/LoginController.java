package com.kkc.cloud.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import jakarta.servlet.http.HttpSession;

@Controller
public class LoginController {
	
	public static String id = "kangkyuchangRS";
	private static String password = "kkc59161596!C";

	@PostMapping("/main")
	public String login(@RequestParam("id") String id, @RequestParam("password") String password, HttpSession session) {
		if(id == null || password == null)
			return "redirect:/login/login.html";
		if(id.equals(LoginController.id) && password.equals(LoginController.password)) {
			session.setAttribute("id", id);
			return "main.html";
		}
		return "redirect:/login/login.html";
	}
}
