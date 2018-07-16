import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'

const sideMenu = (props) => {
    return (
        <ul className="list-group">
            <li className="list-group-item col-md-12">
                <p>Options</p>
            </li>

            <li className="list-group-item col-md-12">
                <input type="file" accept=".json" id="fileInput" aria-describedby="fileHelp"
                style={{width:'parent'}}
                onChange={props.submitted} />
            </li>

            <li className="list-group-item col-md-12">
                <button onClick={props.saveClicked}>Save</button>
            </li>

            <li className="list-group-item col-md-12">
                <p>Files</p>
            </li>
        </ul>
    );
}

export default sideMenu;