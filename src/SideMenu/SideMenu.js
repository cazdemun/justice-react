import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'

const sideMenu = (props) => {
    return (
        <ul className="list-group">
            <li className="list-group-item col-md-12">
                <p>Options</p>
            </li>
            <div className="row">
                <li className="list-group-item col-md-6 col-lg-6 col-xl-6">
                    <input type="file" accept=".json" id="fileInput" aria-describedby="fileHelp"
                    onChange={props.submitted} />
                </li>
                <li className="list-group-item col-md-6 col-lg-6 col-xl-6">
                    <button onClick={props.saveClicked}>Save</button>
                </li>
                <li className="list-group-item col-md-6 col-lg-6 col-xl-6">
                    <input style={{width: 'parent'}}/>
                </li>
                <li className="list-group-item col-md-6 col-lg-6 col-xl-6">
                    <button onClick={props.addClicked}>Add</button>
                </li>
            </div>
            <li className="list-group-item col-md-12">
                <p>Files</p>
            </li>
        </ul>
    );
}

export default sideMenu;