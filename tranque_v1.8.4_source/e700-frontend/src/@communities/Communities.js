import React, {Component} from 'react';
import {MuiThemeProvider} from '@material-ui/core/styles';
import theme from './theme';
import {Routes} from '@communities/Routes';
import {connect} from 'react-redux';


class Communities extends Component {
    componentDidMount() {
        window.addEventListener('resize', this.props.onResize);
    }

    render() {
        return (
            <MuiThemeProvider theme={theme}>
                <Routes/>
            </MuiThemeProvider>
        );
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onResize: () => dispatch({
            type: 'RESIZE_WINDOW'
        })
    };
};

export default connect(null, mapDispatchToProps)(Communities);
