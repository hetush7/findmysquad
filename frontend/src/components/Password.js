import React, { useState } from 'react'

import "assets/css/SearchBar.css";

function Password({ placeholder, data }) {
    const [filteredData, setFilteredData] = useState([]);
    const [wordEntered, setWordEntered] = useState("");

    const handleFilter = (event) => {
        const userName = event.target.value;
        const newFilter = data.filter((value) => {
            return value.username.toLowerCase().includes(userName.toLowerCase());
        });

        if (userName === "") {
            setFilteredData([]);
        } else {
            setFilteredData(newFilter);
        }

        console.log(userName);
    }

    return (
        <div className="search">
            <div className="searchInputs">
                <input type="text" placeholder={placeholder} onChange={handleFilter}/>
            </div>
            {filteredData.length != 0 && (
                <div className="dataResult">
                    {filteredData.slice(0, 10).map((value, key) => {
                        return (
                            <a className="dataItem" /* href={value.id} */ target="_blank">
                                <p>{value.username} </p>
                            </a>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default Password
