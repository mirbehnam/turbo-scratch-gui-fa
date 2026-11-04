// Touch has no hover: adapt hover presets at the category boundary only.
export const installTouchCategoryTap = (element, Blockly, isDisabled, getMode, isOpen, setOpen) => {
    element.addEventListener('touchend', event => {
        if (isDisabled() || getMode() === 'category' || event.changedTouches.length !== 1 ||
            event.touches.length !== 0) return;
        const workspace = Blockly.getMainWorkspace();
        if (workspace.isDragging()) return;
        const toolbox = workspace.getToolbox();
        const item = toolbox.categoryMenu_.categories_.find(category => category.item_.contains(event.target));
        if (!item) return;
        const open = item !== toolbox.selectedItem_ || !isOpen();
        toolbox.setSelectedItem(item);
        setOpen(open);
        Blockly.Touch.clearTouchIdentifier();
        event.preventDefault();
        event.stopImmediatePropagation();
    }, {capture: true, passive: false});
};
