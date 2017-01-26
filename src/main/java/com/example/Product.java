package com.example;

import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import java.awt.*;

/**
 * Created by Lenovo on 2017. 01. 26..
 */
@Data
@Entity
public class Product {


    private @Id @GeneratedValue long id;
    private String name;
    //private Image img;
    private int price;

    private Product(){}

    public Product(String name, int price){
        this.name=name;
        this.price=price;
    }
}
