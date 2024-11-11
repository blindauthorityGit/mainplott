export default function handleShowDetails({ uploadedFile, setModalOpen }) {
    console.log(uploadedFile, setModalOpen);
    if (uploadedFile) {
        setModalOpen(true);
    }
}
