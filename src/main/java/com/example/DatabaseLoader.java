package com.example;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.awt.*;
import java.awt.image.ImageObserver;
import java.awt.image.ImageProducer;

/**
 * Created by Lenovo on 2017. 01. 26..
 */
@Component
public class DatabaseLoader implements CommandLineRunner{

    private final ProductRepository products;
    private final ManagerRepository managers;

    @Autowired
    public DatabaseLoader(ProductRepository products,ManagerRepository managers){
        this.managers=managers;
        this.products=products;
    }

    @Override
    public void run(String... strings) throws Exception {
        Manager viktor = this.managers.save(
                new Manager("viktor","1234","ROLE_MANAGER"));
        Manager gabor = this.managers.save(
                new Manager("gabor","gabor","ROLE_MANAGER"));

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("viktor","doesn't matter",
                        AuthorityUtils.createAuthorityList("ROLE_MANAGER")));

        String[] names={"BBLeather","BBSSteel","Black","Maverick","Onyx","WhiteSilver"};
        int[] prices={95,100,140,160,140,100};
        //this.repository.save(new Product(names[0],getImage(names[0]),prices[0]);
        for (int i = 0; i < 3; i++) {
            this.products.save(new  Product(names[i],prices[i],viktor));
        }

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("gabor","doesn't matter",
                        AuthorityUtils.createAuthorityList("ROLE_MANAGER")));


        for (int i = 0; i < names.length; i++) {
            this.products.save(new  Product(names[i],prices[i],gabor));
        }

        SecurityContextHolder.clearContext();
    }
}
