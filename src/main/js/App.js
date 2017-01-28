'use strict';

const React = require('react');
const ReactDOM = require('react-dom')
const when = require('when');
const client = require('./client');

const follow = require('./follow');

const stompClient = require('./websocket-listener');

const root = '/api';

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {products: [], attributes: [], page: 1,pageSize: 2, links: {}};
        this.updatePageSize = this.updatePageSize.bind(this);
        this.onCreate = this.onCreate.bind(this);
        this.onUpdate = this.onUpdate.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.onNavigate = this.onNavigate.bind(this);
        this.refreshCurrentPage = this.refreshCurrentPage.bind(this);
        this.refreshAndGoToLastPage = this.refreshAndGoToLastPage.bind(this);
    }

    loadFromServer(pageSize) {
        follow(client, root, [
            {rel: 'products', params: {size: pageSize}}]
        ).then(productCollection=> {
            return client({
                method: 'GET',
                path: productCollection.entity._links.profile.href,
                headers: {'Accept': 'application/schema+json'}
            }).then(schema=> {
                this.schema = schema.entity;
                this.links = productCollection.entity._links;
                return productCollection;
            });
        }).then(productCollection=> {
            this.page = productCollection.entity.page;
            return productCollection.entity._embedded.products.map(product=>
                client({
                    method: 'GET',
                    path: product._links.self.href
                })
            );
        }).then(productPromises=> {
            return when.all(productPromises);
        }).done(products=> {
            this.setState({
                page: this.page,
                products: products,
                attributes: Object.keys(this.schema.properties),
                pageSize: pageSize,
                links: this.links
            });
        });
    }

    onCreate(newProduct) {
        follow(client, root, ['products']).done(response=> {
            client({
                method: 'POST',
                path: response.entity._links.self.href,
                entity: newProduct,
                headers: {'Content-Type': 'application/json'}
            })
        })
    }

    onUpdate(product, updatedProduct) {
        client({
            method: 'PUT',
            path: product.entity._links.self.href,
            entity: updatedProduct,
            headers: {
                'Content-Type': 'application/json',
                'If-Match': product.headers.Etag
            }
        }).done(response=> {

        }, response=> {
            if (response.status.code === 412) {
                alert('DENIED: Unable to update ' +
                    product.entity._links.self.href + '. Your copy is stale.');
            }
        });
    }

    onDelete(product) {
        client({method: 'DELETE', path: product.entity._links.self.href});
    }

    onNavigate(navUri) {
        client({
            method: 'GET',
            path: navUri
        }).then(productCollection => {
            this.links = productCollection.entity._links;
            this.page = productCollection.entity.page;

            return productCollection.entity._embedded.products.map(product=>
                client({
                    method: 'GET',
                    path: product._links.self.href
                })
            );
        }).then(productPromises=> {
            return when.all(productPromises);
        }).done(products=> {
            this.setState({
                page: this.page,
                products: products,
                attributes: Object.keys(this.schema.properties),
                pageSize: this.state.pageSize,
                links: this.links
            });
        });
    }

    updatePageSize(pageSize) {
        if (pageSize !== this.state.pageSize) {
            this.loadFromServer(pageSize);
        }
    }

    refreshAndGoToLastPage(message){
        follow(client,root,[{
            rel:'products',
            params:{size:this.state.pageSize}
        }]).done(response=>{
            if(response.entity._links.last!==undefined){
                this.onNavigate(response.entity._links.last.href);
            }else{
                this.onNavigate(response.entity._links.self.href);
            }
        })
    }

    refreshCurrentPage(message){
        follow(client,root,[{
            rel:'products',
            params:{
                size: this.state.pageSize,
                page: this.state.page.number
            }
        }]).then(productCollection =>{
            this.links = productCollection.entity._links;
            this.page = productCollection.entity.page;

            return productCollection.entity._embedded.products.map(product=>{
                return client({
                    method: 'GET',
                    path: product._links.self.href
                })
            });
        }).then(productPromises =>{
            return when.all(productPromises);
        }).then(products =>{
            this.setState({
                page: this.page,
                products: products,
                attributes: Object.keys(this.schema.properties),
                pageSize: this.state.pageSize,
                links: this.links
            });
        });
    }

    componentDidMount() {
        this.loadFromServer(this.state.pageSize);
        stompClient.register([
            {route: '/topic/newProduct',callback: this.refreshAndGoToLastPage},
            {route: '/topic/updateProduct',callback: this.refreshCurrentPage},
            {route: '/topic/deleteProduct',callback: this.refreshCurrentPage}
        ]);
    }



    render() {
        return (
            <div>
                <CreateDialog attributes={this.state.attributes} onCreate={this.onCreate}/>
                <ProductList
                    page={this.state.page}
                    products={this.state.products}
                    links={this.state.links}
                    pageSize={this.state.pageSize}
                    attributes={this.state.attributes}
                    onNavigate={this.onNavigate}
                    onUpdate={this.onUpdate}
                    onDelete={this.onDelete}
                    updatePageSize={this.updatePageSize}/>
            </div>
        )
    }
}

class CreateDialog extends React.Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(e) {
        e.preventDefault();
        var newProduct = {};
        this.props.attributes.forEach(attribute=> {
            newProduct[attribute] = ReactDOM.findDOMNode(this.refs[attribute]).value.trim();
        });
        this.props.onCreate(newProduct);
        this.props.attributes.forEach(attribute=> {
            ReactDOM.findDOMNode(this.refs[attribute]).value = '';
        });
        window.location = '#';
    }

    render() {
        var inputs = this.props.attributes.map(attribute=>
            <p key={attribute}>
                <input type="text" placeholder={attribute} ref={attribute} className="field"/>
            </p>
        );
        return (
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

class UpdateDialog extends React.Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(e) {
        e.preventDefault();
        var updatedProduct = {};
        this.props.attributes.forEach(attribute=> {
            updatedProduct[attribute] = ReactDOM.findDOMNode(this.refs[attribute]).value.trim();
        });
        this.props.onUpdate(this.props.product, updatedProduct);
        window.location = "#";
    }

    render() {
        var inputs = this.props.attributes.map(attribute =>
            <p key={this.props.product.entity[attribute]}>
                <input type="text" placeholder={attribute}
                       defaultValue={this.props.product.entity[attribute]}
                       ref={attribute} className="field"/>
            </p>
        );

        var dialogId = "updateProduct-" + this.props.product.entity._links.self.href;

        return (
            <div>
                <a href={"#" + dialogId}>Update</a>
                <div id={dialogId} className="modalDialog">
                    <div>
                        <a href="#" title="Close" className="close">X</a>

                        <h2>Update a product</h2>

                        <form>
                            {inputs}
                            <button onClick={this.handleSubmit}>Update</button>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}


class ProductList extends React.Component {

    constructor(props) {
        super(props);
        this.handleNavFirst = this.handleNavFirst.bind(this);
        this.handleNavPrev = this.handleNavPrev.bind(this);
        this.handleNavNext = this.handleNavNext.bind(this);
        this.handleNavLast = this.handleNavLast.bind(this);
        this.handleInput = this.handleInput.bind(this);
    }

    handleInput(e) {
        e.preventDefault();
        var pageSize = ReactDOM.findDOMNode(this.refs.pageSize).value;
        if (/^[0-9]+$/.test(pageSize)) {
            this.props.updatePageSize(pageSize);
        } else {
            ReactDOM.findDOMNode(this.refs.pageSize).value = pageSize.substring(0, pageSize.length - 1);
        }
    }

    handleNavFirst(e) {
        e.preventDefault();
        this.props.onNavigate(this.props.links.first.href);
    }

    handleNavPrev(e) {
        e.preventDefault();
        this.props.onNavigate(this.props.links.prev.href);
    }

    handleNavNext(e) {
        e.preventDefault();
        this.props.onNavigate(this.props.links.next.href);
    }

    handleNavLast(e) {
        e.preventDefault();
        this.props.onNavigate(this.props.links.last.href);
    }

    render() {
        var pageInfo = this.props.page.hasOwnProperty("number")?
            <h3>Products - Page {this.props.page.number+1} of {this.props.page.totalPages}</h3> : null;

        var products = this.props.products.map(product =>
            <Product key={product.entity._links.self.href}
                     product={product}
                     attributes={this.props.attributes}
                     onUpdate={this.props.onUpdate}
                     onDelete={this.props.onDelete}/>
        );

        var navLinks = [];

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

        return (
            <div>
                {pageInfo}
                <input ref="pageSize" defaultValue={this.props.pageSize} onInput={this.handleInput}/>
                <table>
                    <tbody>
                    <tr>
                        <th>Name</th>
                        <th>Price</th>
                        <th></th>
                        <th></th>
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

class Product extends React.Component {
    constructor(props) {
        super(props);
        this.handleDelete = this.handleDelete.bind(this);
    }

    handleDelete() {
        this.props.onDelete(this.props.product);
    }

    render() {
        return (
            <tr>
                <td>{this.props.product.entity.name}</td>
                <td>{this.props.product.entity.price}</td>
                <td><img src="https://d30y9cdsu7xlg0.cloudfront.net/png/16757-200.png" alt="X" width="50px"
                         height="50px"/></td>
                <td>
                    <UpdateDialog product={this.props.product}
                                  attributes={this.props.attributes}
                                  onUpdate={this.props.onUpdate}/>
                </td>
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