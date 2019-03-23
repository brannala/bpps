import React from "react";
import ReactDOM from "react-dom";

class GetFile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            uploadedFileContents: null,
            waitingForFileUpload: false
        };
    }
    
    static readUploadedFileAsText = inputFile => {
        const temporaryFileReader = new FileReader();
        
        return new Promise((resolve, reject) => {
            temporaryFileReader.onerror = () => {
                temporaryFileReader.abort();
                reject(new DOMException("Problem parsing input file."));
            };
            
            temporaryFileReader.onload = () => {
                resolve(temporaryFileReader.result);
            };
            temporaryFileReader.readAsText(inputFile);
        });
    };
    
    uploadFile = async event => {
        event.persist();
        if (!event.target || !event.target.files) {
            return;
        }
        
        this.setState({ waitingForFileUpload: true });
        const fileList = event.target.files;
        // Uploads will push to the file input's `.files` array. Get the last uploaded file.
        const latestUploadedFile = fileList.item(fileList.length - 1);
        try {
            const fileContents = await GetFile.readUploadedFileAsText(latestUploadedFile);
            this.setState({
                uploadedFileContents: fileContents,
                waitingForFileUpload: false });
            this.props.readFile(fileContents,fileList[0].name);
            if(this.props.fileType === "sequence")
                this.props.initPosInLocusArray();
        } catch (e) {
            console.log(e);
            this.setState({
                waitingForFileUpload: false
            });
        }
    };
    
    render() {
        return (
            <div className='read-seqs'>
              <input
                accept='.txt'
                multiple
                onChange={e => this.uploadFile(e)}
                type="file"
              />
            </div>
        );
    }
}

export default GetFile;
