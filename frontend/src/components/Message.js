import React from 'react'
import PropTypes from 'prop-types'

import { Alert } from 'reactstrap'

const Message = ({ msg }) => {
    return (
        <Alert color="info">
            {msg}
        </Alert>
    )
}

Message.propTypes = {
    msg: PropTypes.string.isRequired
}

export default Message
