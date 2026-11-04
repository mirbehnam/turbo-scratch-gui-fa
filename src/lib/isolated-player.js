// A data URL gives this sandbox its own origin, separate from the editor.
// The player then creates its blob URL in that origin, allowing its SVG iframe
// to be same-origin with the player without granting access to the editor.
const bootstrap = `<script>
window.addEventListener('message', function receivePlayer (event) {
    if (event.source !== window.parent || !(event.data instanceof Blob)) return;
    window.removeEventListener('message', receivePlayer);
    window.location.replace(URL.createObjectURL(event.data));
});
</script>`;

export const isolatedPlayerBootstrap = `data:text/html;charset=utf-8,${encodeURIComponent(bootstrap)}`;
