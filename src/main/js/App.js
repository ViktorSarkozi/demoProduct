/**
 * Created by Lenovo on 2017. 01. 26..
 */
'use strict'

const React = require('react');
const ReactDOM = require('react-dom');
const client = require('./client');

const follow = require('./follow');
const root='/api';

class App extends React.Component{

    constructor(props){
        super(props);
        this.state={products: [],attributes:[],pageSize:2,links:{}};
        this.updatePageSize=this.updatePageSize.bind(this);
        this.onCreate = this.onCreate.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.onNavigate = this.onNavigate.bind(this);
    }

    loadFromServer(pageSize){
        follow(client,root,[
            {rel:'products',params:{size:pageSize}}]
        ).then(productCollection=>{
            return client({
                method:'GET',
                path: productCollection.entity._links.profile.href,
                headers: {'Accept':'application/schema+json'}
            }).then(schema=>{
                this.schema=schema.entity;
                return productCollection;
            });
        }).done(productCollection=>{
            this.setState({
                products: productCollection.entity._embedded.products,
                attributes: Object.keys(this.schema.properties),
                pageSize:pageSize,
                links:productCollection.entity._links
            });
        });
    }

    onCreate(newProduct){
        follow(client,root,['products']).then(productCollection=>{
            return client({
                method: 'POST',
                path: productCollection.entity._links.self.href,
                entity: newProduct,
                headers: {'Content-Type': 'application/json'}
            })
        }).then(response=>{
            return follow(client,root,[{
                rel:'products',params:{'size':this.state.pageSize}
            }]);
        }).done(response=>{
            this.onNavigate(response.entity._links.last.href);
        });
    }

    onDelete(product){
        client({method: 'DELETE',path:product._links.self.href}).done(response=>{
            this.loadFromServer(this.state.pageSize);
        });
    }

    onNavigate(navUri){
        client({method:'GET',path:navUri}).done(productCollection=>{
            this.setState({
                products:productCollection.entity._embedded.products,
                attributes:this.state.attributes,
                pageSize: this.state.pageSize,
                links: productCollection.entity._links
            });
        });
    }

    updatePageSize(pageSize){
        if(pageSize !== this.state.pageSize){
            this.loadFromServer(pageSize);
        }
    }

    componentDidMount(){
        this.loadFromServer(this.state.pageSize);
    }

    render(){
        return(
            <div>
                <CreateDialog attributes={this.state.attributes} onCreate={this.onCreate}/>
                <ProductList
                    products={this.state.products}
                    links={this.state.links}
                    pageSize={this.state.pageSize}
                    onNavigate={this.onNavigate}
                    onDelete={this.onDelete}
                    updatePageSize={this.updatePageSize}/>
            </div>
        )
    }
}

class CreateDialog extends React.Component{
    constructor(props){
        super(props);
        this.handleSubmit=this.handleSubmit.bind(this);
    }

    handleSubmit(e){
        e.preventDefault();
        var newProduct={};
        this.props.attributes.forEach(attribute=>{
            newProduct[attribute]=ReactDOM.findDOMNode(this.refs[attribute]).value.trim();
        });
        this.props.onCreate(newProduct);

        this.props.attributes.forEach(attribute=>{
            ReactDOM.findDOMNode(this.refs[attribute]).value='';
        });

        window.location='#';
    }

    render(){
        var inputs = this.props.attributes.map(attribute=>
            <p key={attribute}>
                <input type="text" placeholder={attribute} ref={attribute} className="field"/>
            </p>
        );

        return(
            <div>
                <a href="#createProduct">Create</a>

                <div id="createProduct" className="modalDialog">
                    <div>
                        <a href="#" title="Close" className="close">X</a>
                        <h2>Create new product</h2>

                        <form>
                            {inputs}
                            <button onClick={this.handleSubmit}>Create</button>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}

class ProductList extends React.Component{

    constructor(props){
        super(props);
        this.handleNavFirst = this.handleNavFirst.bind(this);
        this.handleNavPrev = this.handleNavPrev.bind(this);
        this.handleNavNext = this.handleNavNext.bind(this);
        this.handleNavLast = this.handleNavLast.bind(this);
        this.handleInput = this.handleInput.bind(this);
    }

    handleInput(e){
        e.preventDefault();
        var pageSize=ReactDOM.findDOMNode(this.refs.pageSize).value;
        if(/^[0-9]+$/.test(pageSize)){
            this.props.updatePageSize(pageSize);
        }else{
            ReactDOM.findDOMNode(this.refs.pageSize).value=
                pageSize.substring(0,pageSize.length-1);
        }
    }

    handleNavFirst(e){
        e.preventDefault();
        this.props.onNavigate(this.props.links.first.href);
    }

    handleNavPrev(e){
        e.preventDefault();
        this.props.onNavigate(this.props.links.prev.href);
    }

    handleNavNext(e){
        e.preventDefault();
        this.props.onNavigate(this.props.links.next.href);
    }

    handleNavLast(e){
        e.preventDefault();
        this.props.onNavigate(this.props.links.last.href);
    }

    render(){
        var products=this.props.products.map(product =>
        <Product key={product._links.self.href} product={product} onDelete={this.props.onDelete}/>
        );

        var navLinks=[];

        if ("first" in this.props.links) {
            navLinks.push(<button key="first" onClick={this.handleNavFirst}>&lt;&lt;</button>);
        }
        if ("prev" in this.props.links) {
            navLinks.push(<button key="prev" onClick={this.handleNavPrev}>&lt;</button>);
        }
        if ("next" in this.props.links) {
            navLinks.push(<button key="next" onClick={this.handleNavNext}>&gt;</button>);
        }
        if ("last" in this.props.links) {
            navLinks.push(<button key="last" onClick={this.handleNavLast}>&gt;&gt;</button>);
        }

        return(
               <div>
                   <input ref="pageSize" defaultValue={this.props.pageSize} onInput={this.handleInput}/>
                   <table>
                       <tbody>
                            <tr>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Img</th>
                                <th></th>
                            </tr>
                            {products}
                       </tbody>
                   </table>
                   <div>
                       {navLinks}
                   </div>
               </div>
        )
    }
}

class Product extends React.Component{
    constructor(props){
        super(props);
        this.handleDelete=this.handleDelete.bind(this);
    }

    handleDelete(){
        this.props.onDelete(this.props.product);
    }

    render(){
        return(
            <tr>
                <td>{this.props.product.name}</td>
                <td>{this.props.product.price}</td>
                <td><img src="https://d30y9cdsu7xlg0.cloudfront.net/png/16757-200.png" alt="X" width="50px" height="50px"/></td>
                <td>
                    <button onClick={this.handleDelete}>Delete</button>
                </td>
            </tr>
        )
    }
}

ReactDOM.render(
   <App/>,
    document.getElementById('react')
)