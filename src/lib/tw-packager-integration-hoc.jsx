import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {getIsShowingProject} from '../reducers/project-state';
import PackagerModal from '../components/packager-modal/packager-modal.jsx';

const PackagerIntegrationHOC = WrappedComponent => {
    class PackagerIntegrationComponent extends React.Component {
        constructor (props) {
            super(props);
            this.state = {open: false};
            this.handleClickPackager = this.handleClickPackager.bind(this);
            this.handleClosePackager = this.handleClosePackager.bind(this);
        }
        handleClickPackager () {
            if (this.props.canOpenPackager) this.setState({open: true});
        }
        handleClosePackager () {
            this.setState({open: false});
        }
        render () {
            const {canOpenPackager: _canOpenPackager, packagerTheme, ...props} = this.props;
            return (
                <React.Fragment>
                    <WrappedComponent
                        onClickPackager={this.handleClickPackager}
                        {...props}
                    />
                    {this.state.open && <PackagerModal
                        vm={this.props.vm}
                        title={this.props.reduxProjectTitle}
                        theme={packagerTheme}
                        onClose={this.handleClosePackager}
                    />}
                </React.Fragment>
            );
        }
    }
    PackagerIntegrationComponent.propTypes = {
        canOpenPackager: PropTypes.bool,
        reduxProjectTitle: PropTypes.string,
        packagerTheme: PropTypes.object.isRequired,
        vm: PropTypes.shape({saveProjectSb3: PropTypes.func}).isRequired
    };
    return connect(state => ({
        canOpenPackager: getIsShowingProject(state.scratchGui.projectState.loadingState),
        reduxProjectTitle: state.scratchGui.projectTitle,
        packagerTheme: state.scratchGui.theme.theme,
        vm: state.scratchGui.vm
    }))(PackagerIntegrationComponent);
};
export default PackagerIntegrationHOC;
