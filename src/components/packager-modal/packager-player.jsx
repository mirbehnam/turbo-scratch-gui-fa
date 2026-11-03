import React, {useCallback, useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import styles from './packager-modal.css';

const messages = defineMessages({
    running: {id: 'tw.packager.running', defaultMessage: 'Direct play'},
    close: {id: 'tw.packager.closePlayer', defaultMessage: 'Close'},
    refresh: {id: 'tw.packager.refreshPlayer', defaultMessage: 'Refresh'}
});

const PackagerPlayer = ({blob, name, intl, onClose}) => {
    const [url, setUrl] = useState(null);
    const [revision, setRevision] = useState(0);
    const frame = useRef(null);
    useEffect(() => {
        const source = URL.createObjectURL(blob);
        setUrl(source);
        return () => URL.revokeObjectURL(source);
    }, [blob]);
    const refresh = useCallback(() => setRevision(value => value + 1), []);
    const focus = useCallback(() => frame.current.focus(), []);
    return (
        <div className={styles.player}>
            <div className={styles.playerToolbar}>
                <span className={styles.playerTitle}>{name}</span>
                <button
                    className={styles.playerButton}
                    type="button"
                    onClick={refresh}
                >
                    <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path d="M20 7v5h-5M20 12a8 8 0 1 0-2 5M20 12l-4-5" />
                    </svg>
                    {intl.formatMessage(messages.refresh)}
                </button>
                <button
                    className={styles.playerButton}
                    type="button"
                    onClick={onClose}
                >
                    <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path d="m6 6 12 12M18 6 6 18" />
                    </svg>
                    {intl.formatMessage(messages.close)}
                </button>
            </div>
            {url && <iframe
                key={revision}
                ref={frame}
                className={styles.playerFrame}
                title={intl.formatMessage(messages.running)}
                src={url}
                sandbox="allow-scripts allow-downloads allow-forms allow-modals allow-pointer-lock"
                allow="autoplay; fullscreen; gamepad"
                allowFullScreen
                onLoad={focus}
            />}
        </div>
    );
};

PackagerPlayer.propTypes = {
    blob: PropTypes.instanceOf(Blob).isRequired,
    name: PropTypes.string.isRequired,
    intl: intlShape.isRequired,
    onClose: PropTypes.func.isRequired
};

export default injectIntl(PackagerPlayer);
