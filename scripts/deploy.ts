import {ethers} from 'hardhat';

async function main() {
    const voting  = await ethers.deployContract("Voting", [], {
    })
    await voting.waitForDeployment();

    console.log(
        `voting deployed to ${voting.target}`
    )

}

main().catch((error) => {
    console.error(error);
    process.exit(1);
})


