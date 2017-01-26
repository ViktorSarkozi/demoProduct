/**
 * Created by Lenovo on 2017. 01. 26..
 */
'use strict'

const React = require('react');
const ReactDOM = require('react-dom')
const client = require('./client');

class App extends React.Component{

    constructor(props){
        super(props);
        this.state={products: []};
    }

    componentDidMount(){
        client({method: 'GET', path:'/api/products'}).done(response=>{
            this.setState({products: response.entity._embedded.products});
        });
    }

    render(){
        return(
            <ProductList products={this.state.products}/>
        )
    }
}


class ProductList extends React.Component{
    render(){
        var products=this.props.products.map(product =>
        <Product key={product._links.self.href} product={product}/>
        );
        return(
                <table>
                    <tbody>
                        <tr>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Picture</th>
                        </tr>
                        {products}
                    </tbody>
                </table>
        )
    }
}

class Product extends React.Component{
    render(){
        return(
            <tr>
                <td>{this.props.product.name}</td>
                <td>{this.props.product.price}</td>
                <td><img src="https://d30y9cdsu7xlg0.cloudfront.net/png/16757-200.png" alt="X" width="50px" height="50px"/></td>
            </tr>
        )
    }
}

ReactDOM.render(
    <App/>,
    document.getElementById('react')
)