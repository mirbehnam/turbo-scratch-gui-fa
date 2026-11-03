import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useState} from 'react';
import {defineMessages, FormattedMessage, injectIntl, intlShape} from 'react-intl';
import {connect} from 'react-redux';
import locales from '../../lib/supported-locales';
import {selectLocale} from '../../reducers/locales';
import Modal from '../modal/modal.jsx';
import check from './check.svg';
import languageIcon from '../language-selector/language-icon.svg';
import menuBarStyles from './menu-bar.css';
import styles from './language-menu.css';

const messages = defineMessages({
    menu: {
        id: 'gui.aria.languageMenu',
        defaultMessage: 'Language menu',
        description: 'Accessibility label for the language dialog button'
    },
    title: {
        id: 'gui.menuBar.language',
        defaultMessage: 'Language',
        description: 'Button and title for the language dialog'
    }
});

const LanguageMenu = ({currentLocale, isRtl, onChangeLanguage, intl}) => {
    const [isOpen, setIsOpen] = useState(false);
    const handleOpen = useCallback(() => setIsOpen(true), []);
    const handleClose = useCallback(() => setIsOpen(false), []);
    const handleChange = useCallback(locale => {
        setIsOpen(false);
        onChangeLanguage(locale);
    }, [onChangeLanguage]);
    useEffect(() => {
        document.documentElement.lang = currentLocale;
        document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    }, [currentLocale, isRtl]);

    return (
        <React.Fragment>
            <button
                aria-label={intl.formatMessage(messages.menu)}
                className={classNames(menuBarStyles.menuBarItem, menuBarStyles.hoverable, styles.languageButton)}
                onClick={handleOpen}
            >
                <img
                    className={styles.languageIcon}
                    src={languageIcon}
                    draggable={false}
                />
                <span className={menuBarStyles.collapsibleLabel}>
                    <FormattedMessage {...messages.title} />
                </span>
            </button>
            {isOpen && <Modal
                className={styles.languageDialog}
                contentLabel={intl.formatMessage(messages.title)}
                isRtl={isRtl}
                onRequestClose={handleClose}
            >
                <div className={styles.languageList}>
                    {Object.keys(locales).map(locale => (
                        <button
                            key={locale}
                            aria-pressed={currentLocale === locale}
                            className={classNames(styles.languageOption, {
                                [styles.selectedOption]: currentLocale === locale
                            })}
                            lang={locale}
                            // eslint-disable-next-line react/jsx-no-bind
                            onClick={() => handleChange(locale)}
                        >
                            <img
                                aria-hidden
                                className={classNames(styles.check, {[styles.selectedCheck]: currentLocale === locale})}
                                src={check}
                                draggable={false}
                            />
                            <span>{locales[locale].name}</span>
                        </button>
                    ))}
                </div>
            </Modal>}
        </React.Fragment>
    );
};

LanguageMenu.propTypes = {
    currentLocale: PropTypes.string.isRequired,
    intl: intlShape.isRequired,
    isRtl: PropTypes.bool.isRequired,
    onChangeLanguage: PropTypes.func.isRequired
};

export default connect(state => ({
    currentLocale: state.locales.locale,
    isRtl: state.locales.isRtl
}), dispatch => ({
    onChangeLanguage: locale => dispatch(selectLocale(locale))
}))(injectIntl(LanguageMenu));
