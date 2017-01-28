package com.example;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.core.annotation.HandleAfterCreate;
import org.springframework.data.rest.core.annotation.HandleAfterDelete;
import org.springframework.data.rest.core.annotation.HandleAfterSave;
import org.springframework.data.rest.core.annotation.RepositoryEventHandler;

import org.springframework.hateoas.EntityLinks;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import static com.example.WebSocketConfiguration.*;

/**
 * Created by Lenovo on 2017. 01. 27..
 */
@Component
@RepositoryEventHandler(Product.class)
public class EventHandler {

    private final SimpMessagingTemplate websocket;

    private final EntityLinks entityLinks;

    @Autowired
    public EventHandler(SimpMessagingTemplate websocket, EntityLinks entityLinks){
        this.websocket=websocket;
        this.entityLinks=entityLinks;
    }

    @HandleAfterCreate
    public void newProduct(Product product){
        this.websocket.convertAndSend(
                MESSAGE_PREFIX+"/newProduct",getPath(product));
    }

    @HandleAfterDelete
    public void deleteProduct(Product product){
        this.websocket.convertAndSend(
                MESSAGE_PREFIX+"/deleteProduct",getPath(product));
    }

    @HandleAfterSave
    public void updateProduct(Product product){
        this.websocket.convertAndSend(
                MESSAGE_PREFIX+"/updateProduct",getPath(product));
    }

    private String getPath(Product product){
        return this.entityLinks.linkForSingleResource(product.getClass(),
                product.getId()).toUri().getPath();
    }
}
