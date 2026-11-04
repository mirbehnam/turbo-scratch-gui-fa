import React, {useCallback, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import {isolatedPlayerBootstrap} from '../../lib/isolated-player';
import styles from './packager-modal.css';

const messages = defineMessages({
    running: {id: 'tw.packager.running', defaultMessage: 'Direct play'},
    close: {id: 'tw.packager.closePlayer', defaultMessage: 'Close'},
    refresh: {id: 'tw.packager.refreshPlayer', defaultMessage: 'Refresh'}
});

const PackagerPlayer = ({blob, name, intl, onClose}) => {
    const [revision, setRevision] = useState(0);
    const frame = useRef(null);
    const initializedFrames = useRef(new WeakSet());
    const refresh = useCallback(() => setRevision(value => value + 1), []);
    const handleLoad = useCallback(event => {
        const player = event.currentTarget;
        if (!initializedFrames.current.has(player)) {
            initializedFrames.current.add(player);
            player.contentWindow.postMessage(blob, '*');
        }
        player.focus();
    }, [blob]);
    return (
        <div className={styles.player}>
            <div className={styles.playerToolbar}>
                <button
                    className={styles.playerButton}
                    type="button"
                    onClick={refresh}
                    aria-label={intl.formatMessage(messages.refresh)}
                    title={intl.formatMessage(messages.refresh)}
                >
                    <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path d="M20 7v5h-5M20 12a8 8 0 1 0-2 5M20 12l-4-5" />
                    </svg>
                </button>
                <button
                    className={styles.playerButton}
                    type="button"
                    onClick={onClose}
                    aria-label={intl.formatMessage(messages.close)}
                    title={intl.formatMessage(messages.close)}
                >
                    <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path d="m6 6 12 12M18 6 6 18" />
                    </svg>
                </button>
            </div>
            <iframe
                key={revision}
                ref={frame}
                className={styles.playerFrame}
                title={`${intl.formatMessage(messages.running)}: ${name}`}
                src={isolatedPlayerBootstrap}
                sandbox="allow-scripts allow-same-origin allow-downloads allow-forms allow-modals allow-pointer-lock"
                allow="autoplay; fullscreen; gamepad"
                allowFullScreen
                onLoad={handleLoad}
            />
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
