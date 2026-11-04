import React, {useCallback, useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import Modal from '../modal/modal.jsx';
import {createPackagerSnapshot, clearPackagerSnapshot} from '../../lib/packager-snapshot.js';
import {exportPackagedFile, isPackagerMessage} from '../../lib/packager-export.js';
import styles from './packager-modal.css';
import PackagerPlayer from './packager-player.jsx';

const messages = defineMessages({
    title: {id: 'tw.packager.title', defaultMessage: 'Package project'},
    preparing: {id: 'tw.packager.preparing', defaultMessage: 'Saving a temporary copy of the current project…'},
    ready: {id: 'tw.packager.ready', defaultMessage: 'HTML file is ready'},
    save: {id: 'tw.packager.save', defaultMessage: 'Save'},
    share: {id: 'tw.packager.share', defaultMessage: 'Share'},
    run: {id: 'tw.packager.run', defaultMessage: 'Run directly'},
    working: {id: 'tw.packager.working', defaultMessage: 'Please wait…'},
    saved: {id: 'tw.packager.saved', defaultMessage: 'Saved to Downloads: {name}'},
    stored: {id: 'tw.packager.stored', defaultMessage: 'Saved in My Projects: {name}'},
    downloading: {id: 'tw.packager.downloading', defaultMessage: 'Download requested: {name}'},
    shared: {id: 'tw.packager.shared', defaultMessage: 'The sharing window was opened.'},
    // eslint-disable-next-line max-len
    explanation: {id: 'tw.packager.explanation', defaultMessage: 'When you export as html, your game runs much more smoothly and faster 😍 and you can easily share it with your friends.'},
    // eslint-disable-next-line max-len
    engine: {id: 'tw.packager.engine', defaultMessage: 'Please note that html files can no longer be edited in Scratch and are only suitable for running.'},
    // eslint-disable-next-line max-len
    failed: {id: 'tw.packager.failed', defaultMessage: 'The operation could not be completed. Your project has not been changed; please try again.'}
});

const PackagerModal = ({intl, vm, title, theme, onClose}) => {
    const frame = useRef(null);
    const snapshot = useRef(null);
    const session = useRef(`${Date.now()}-${Math.random()}`);
    const [prepared, setPrepared] = useState(false);
    const [result, setResult] = useState(null);
    const [busy, setBusy] = useState(false);
    const [status, setStatus] = useState('');
    const [error, setError] = useState(false);
    const [playing, setPlaying] = useState(false);
    const format = (message, values) => intl.formatMessage(message, values);
    const configure = () => {
        if (frame.current) {
            frame.current.contentWindow.postMessage({p4: {
                type: 'configure',
                locale: intl.locale,
                theme: theme.isDark() ? 'dark' : 'light',
                accent: theme.getGuiColors()['looks-secondary']
            }}, location.origin);
        }
    };
    useEffect(() => {
        let closed = false;
        const controller = new AbortController();
        createPackagerSnapshot(vm, title, session.current, controller.signal).then(value => {
            if (!closed) {
                snapshot.current = value;
                setPrepared(true);
            }
        })
            .catch(err => {
                if (closed) return;
                console.error('Packager snapshot failed:', err);
                if (!closed) setError(true);
            });
        return () => {
            closed = true;
            controller.abort();
            clearPackagerSnapshot(session.current).catch(err => console.warn('Packager snapshot cleanup failed:', err));
        };
    }, []);
    useEffect(() => {
        configure();
    }, [intl.locale, theme]);
    useEffect(() => {
        const receive = event => {
            if (!isPackagerMessage(event, frame.current, location.origin)) return;
            const data = event.data.p4;
            if (data.type === 'ready-for-import' && snapshot.current) {
                configure();
                const {buffer, name} = snapshot.current;
                snapshot.current = null;
                event.source.postMessage({p4: {type: 'start-import'}}, event.origin);
                event.source.postMessage({p4: {type: 'finish-import', name, data: buffer}}, event.origin, [buffer]);
            } else if (data.type === 'export-ready' && data.blob instanceof Blob && /\.html$/i.test(data.name)) {
                setResult({blob: data.blob, name: data.name});
                setError(false);
                setStatus('');
            } else if (data.type === 'settings-export' && data.blob instanceof Blob) {
                exportPackagedFile(data.blob, data.name, 'save', intl.locale).catch(err => {
                    console.error('Packager settings export failed:', err);
                    setError(true);
                });
            }
        };
        window.addEventListener('message', receive);
        return () => window.removeEventListener('message', receive);
    }, [intl.locale, theme]);
    const perform = async action => {
        setBusy(true);
        setError(false);
        setStatus('');
        try {
            const response = await exportPackagedFile(result.blob, result.name, action, intl.locale);
            const message = action === 'share' ? messages.shared :
                (response.location === 'library' ? messages.stored :
                    (response.downloadStarted ? messages.downloading : messages.saved));
            setStatus(format(message, {name: response.name || result.name}));
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Packager file action failed:', action, err);
                setError(true);
            }
        } finally {
            setBusy(false);
        }
    };
    const save = useCallback(() => perform('save'), [result, intl.locale]);
    const share = useCallback(() => perform('share'), [result, intl.locale]);
    const play = useCallback(async () => {
        if (!window.AndroidProjectSaver && !window.AndroidPackagedExport) {
            setPlaying(true);
            return;
        }
        setBusy(true);
        setError(false);
        try {
            await exportPackagedFile(result.blob, result.name, 'preview', intl.locale, {dark: theme.isDark()});
        } catch (err) {
            console.error('Packager Android direct play failed:', err);
            setError(true);
        } finally {
            setBusy(false);
        }
    }, [result, intl.locale, theme]);
    const closePlayer = useCallback(() => setPlaying(false), []);
    const params = new URLSearchParams({import_from: location.origin,
        locale: intl.locale,
        theme: theme.isDark() ? 'dark' : 'light'});
    const source = useRef(new URL(`packager/index.html?${params}`, document.baseURI).href);
    return (
        <Modal
            className={playing ? styles.playerModal : styles.modalContent}
            headerClassName={playing ? styles.hidden : null}
            fullScreen={playing}
            contentLabel={format(result ? messages.ready : messages.title)}
            onRequestClose={playing ? closePlayer : onClose}
            shouldCloseOnOverlayClick={false}
            isRtl={intl.locale !== 'en'}
            id="embeddedPackager"
        >
            <div className={styles.body}>
                {playing && <PackagerPlayer
                    blob={result.blob}
                    name={result.name}
                    onClose={closePlayer}
                />}
                <div className={playing ? styles.hidden : styles.workspace}>
                    {!prepared && <p className={styles.result}>{format(messages.preparing)}</p>}
                    {prepared && <iframe
                        ref={frame}
                        title={format(messages.title)}
                        src={source.current}
                        className={result ? styles.hidden : styles.frame}
                    />}
                    {result && <div className={styles.result}>
                        <p className={styles.filename}>{result.name}</p>
                        <div className={styles.actions}>
                            <button
                                className={styles.button}
                                disabled={busy}
                                onClick={play}
                            >
                                {format(messages.run)}
                            </button>
                            <button
                                className={styles.button}
                                disabled={busy}
                                onClick={save}
                            >
                                {format(messages.save)}
                            </button>
                            <button
                                className={styles.button}
                                disabled={busy}
                                onClick={share}
                            >
                                {format(messages.share)}
                            </button>
                        </div>
                        <p>{format(messages.explanation)}</p>
                        <p>{format(messages.engine)}</p>
                        {busy && <p role="status">{format(messages.working)}</p>}
                        {status && <p role="status">{status}</p>}
                    </div>}
                    {error && <p
                        className={styles.error}
                        role="alert"
                    >{format(messages.failed)}</p>}
                </div>
            </div>
        </Modal>
    );
};
PackagerModal.propTypes = {
    intl: intlShape.isRequired,
    vm: PropTypes.shape({saveProjectSb3: PropTypes.func.isRequired}).isRequired,
    title: PropTypes.string,
    theme: PropTypes.shape({isDark: PropTypes.func.isRequired, getGuiColors: PropTypes.func.isRequired}).isRequired,
    onClose: PropTypes.func.isRequired
};
export default injectIntl(PackagerModal);
