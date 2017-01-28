package com.example;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Version;

/**
 * Created by Lenovo on 2017. 01. 26..
 */
@Data
@Entity
public class Product {


    private @Id @GeneratedValue long id;
    private String name;
    private int price;

    private @Version @JsonIgnore Long version;

    private Product(){}


    public Product(String name,int price){
        this.name=name;
        this.price=price;
    }
}
