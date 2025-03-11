const { assert } = require("chai")
const {Ethers} = require("hardhat")

describe("FileStorage", function () {
    let FileStorage
    let FileStrogeFactory
    beforeEach(async function () {
        FileStrogeFactory = await ethers.getContractFactory("FileStorage")
        FileStorage = await FileStrogeFactory.deploy()

    })

    it("Get the file hash", async function () {
        const expectedhashes = "Qme4dzxqbbwGSBb3HHJrn2utLdTM9W22WfKTJAqV5mFv5Z"
        await FileStorage.uploadFile(expectedhashes)
        const address = "0x7B8E0c1026De30520E6978847FDdF81a17B9Cc73"
        const fileHashes = await FileStorage.getUserFiles(address)
        assert.equal(fileHashes.toString(), expectedhashes)
    })
})