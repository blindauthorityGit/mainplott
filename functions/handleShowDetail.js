export default function handleShowDetails({ uploadedFile, setModalOpen }) {
    if (uploadedFile) {
        setModalOpen(true);
    }
}
