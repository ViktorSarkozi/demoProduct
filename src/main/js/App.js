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
            </tr>
        )
    }
}

ReactDOM.render(
    <App/>,
    document.getElementById('react')
)