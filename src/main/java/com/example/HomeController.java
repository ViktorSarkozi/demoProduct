package com.example;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Created by Lenovo on 2017. 01. 26..
 */
@Controller
public class HomeController {

    @RequestMapping(value="/")
    public String index(){
        return "index";
    }
}
