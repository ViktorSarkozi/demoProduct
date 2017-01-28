package com.example;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import javax.persistence.*;

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

    private @ManyToOne Manager manager;

    private Product(){}


    public Product(String name,int price,Manager manager){
        this.name=name;
        this.price=price;
        this.manager=manager;
    }
}
