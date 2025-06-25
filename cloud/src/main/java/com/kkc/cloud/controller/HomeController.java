package com.kkc.cloud.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import jakarta.servlet.http.HttpSession;

@Controller
public class HomeController {

	@GetMapping("/")
	public String home(HttpSession session) {
		String id = (String) session.getAttribute("id");
		if(id != null) {
			if(id.equals(LoginController.id)) {
				return "main.html";
			}
		}
		return "redirect:/login/login.html";
	}
}
