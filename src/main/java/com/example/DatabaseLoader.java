package com.example;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.awt.*;
import java.awt.image.ImageObserver;
import java.awt.image.ImageProducer;

/**
 * Created by Lenovo on 2017. 01. 26..
 */
@Component
public class DatabaseLoader implements CommandLineRunner{

    private final ProductRepository repository;

    @Autowired
    public DatabaseLoader(ProductRepository repository){
        this.repository=repository;
    }

    @Override
    public void run(String... strings) throws Exception {
        String[] names={"BBLeather","BBSSteel","Black","Maverick","Onyx","WhiteSilver"};
        int[] prices={95,100,140,160,140,100};
        //this.repository.save(new Product(names[0],getImage(names[0]),prices[0]);
        for (int i = 0; i < names.length; i++) {
            this.repository.save(new  Product(names[i],prices[i]));
        }
    }
}
