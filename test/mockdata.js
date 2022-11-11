
const { v4: uuidv4 } = require('uuid');

module.exports = [
    {
        token: uuidv4(),
        uriFile: 'https://amazon-s3.aws/4934s43s/file1.avi',
        hashFile: 'sdfdsf3245ergwegDGEWTWERG2345ergwg',
        uriMetaFile: 'https://amazon-s3.aws/4934s43s/file1.avi',
        hashMetaFile: 'dfgdf4dgerg%#$#$34sdfdsf32445ergwg',
        price: 10,
        uriLicense: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
        copyright: 'antonio perez (c)' 
    },
    {
        token: uuidv4(),
        uriFile: 'https://amazon-s3.aws/4934s43s/file2.avi',
        hashFile: 'sdfdsf3245AAAAAAAAAAAAAAAG2345ergwg',
        uriMetaFile: 'https://amazon-s3.aws/4934s43s/file2.avi',
        hashMetaFile: 'dfgdf4dAAAAAAAAAAAAAAAf32445ergwg',
        price: 5,
        uriLicense: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
        copyright: 'antonio perez (c)' 
    },
    {
        token: uuidv4(),
        uriFile: 'https://amazon-s3.aws/4934s43s/file3.avi',
        hashFile: 'sdfdsf3245AAAAAAAAAAAAAAAG2345ergwg',
        uriMetaFile: 'https://amazon-s3.aws/4934s43s/file3.avi',
        hashMetaFile: 'dfgdf4dAAAAAAAAAAAAAAAf32445ergwg',
        price: 101,
        uriLicense: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
        copyright: 'antonio perez (c)' 
    }
  ];