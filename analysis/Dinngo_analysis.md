# <a id="heading-0"/> Section 1 - Table of Contents 

* 1 - [Table of Contents](#heading-0)
* 2 - [Introduction](#heading-2)
    * 2.1 - [Analysis Goals and Focus](#heading-2.1)
        * 2.1.1 - [Sound Architecture](#heading-2.1.1)
        * 2.1.2 - [Smart Contract Best Practices](#heading-2.1.2)
        * 2.1.3 - [Code Correctness](#heading-2.1.3)
        * 2.1.4 - [Code Quality](#heading-2.1.4)
        * 2.1.5 - [Security](#heading-2.1.5)
        * 2.1.6 - [Testing and testability](#heading-2.1.6)
    * 2.2 - [About Dinngo](#heading-2.2)
* 3 - [Overview](#heading-3)
    * 3.1 - [Source Code](#heading-3.1)
    * 3.2 - [General Notes](#heading-3.2)
    	* 3.2.1 - [Surya](#heading-3.2.1)
    	* 3.2.2 - [Solhint](#heading-3.2.2)
    	* 3.2.3 - [Mythril-classic](#heading-3.2.3)
    	* 3.2.4 - [SmartCheck](#heading-3.2.4)
    	* 3.2.5 - [Slither](#heading-3.2.5)
    * 3.3 - [Contracts](#heading-3.3)
* 4 - [Analysis findings](#heading-4)
    * 4.1 - [Contract control flow](#heading-4.1)
    	* 4.1.1 - [DinngoProxy](#heading-4.1.1)
    	* 4.1.2 - [Dinngo](#heading-4.1.2)
    * 4.2 - [Contract inheritance](#heading-4.2)
    	* 4.2.1 - [DinngoProxy](#heading-4.2.1)
        * 4.2.2 - [Dinngo](#heading-4.2.2)
    * 4.3 - [Smart Contract Weakness Classification](#heading-4.3)
        * 4.3.1 - [Number of Issues](#heading-4.3.1)
        * 4.3.2 - [Issues by Level](#heading-4.3.2)
        * 4.3.3 - [Issue Details](#heading-4.3.3)
* 5 - [Summary](#heading-5)
* [Disclaimer](#heading-d)

# <a id="heading-2"/> Section 2 - Introduction

This analysis report reveals the structure and provides practical assurance of the logic and implementation of the contracts.

## <a id="heading-2.1"/> 2.1 Analysis Goals and Focus

### <a id="heading-2.1.1"/> 2.1.1 Sound Architecture

This report includes an overall architecture and design analysis.


### <a id="heading-2.1.2"/> 2.1.2 Smart Contract Best Practices

This report will evaluate whether the codebase follows the current established best practices for smart contract development.


### <a id="heading-2.1.3"/> 2.1.3 Code Correctness

This report will evaluate whether the code does what it is intended to do.


### <a id="heading-2.1.4"/> 2.1.4 Code Quality

This report will evaluate whether the code has been written in a way that ensures readability and maintainability.


### <a id="heading-2.1.5"/> 2.1.5 Security

This report will look for any exploitable security vulnerabilities, or other potential threats to either the operators of Dinngo or its users.


### <a id="heading-2.1.6"/> 2.1.6 Testing and testability

This report will examine how easily tested the code is, and review how thoroughly tested the code is.


## <a id="heading-2.2"/> 2.2 About Dinngo

Dinngo is a hybrid-based exchange, which enables a single party to place order and match with another. Dinngo does not keep any information about user private key to achieve the trading. The entire settlement is performed by the smart contract which is triggered by Dinngo, while users reserve control of their own asset.

# <a id="heading-3"/> Section 3 - Overview

## <a id="heading-3.1"/> 3.1 Source Code

The Dinngo smart contract source code was made available in the [dinngo-exchange/contracts](https://github.com/Dinngo/dinngo-exchange) Github repository. The code was analyzed as of commit `dc324d5e4f2a1aea5a356ff6878a640c235bc0cf`.

The following Solidity source files (with SHA1 sums) were audited:

```
SHA1(dinngo-exchange/contracts/Administrable.sol)=
56caf3f1792a78c87b7bfc8e1a0d714ebdaef733
SHA1(dinngo-exchange/contracts/Dinngo.sol)=
d0a08a11fe706f024c644cadc40475269530acfc
SHA1(dinngo-exchange/contracts/DinnogProxy.sol)=
4dd3aa3b49814147124072888b0663b516df40f3
SHA1(dinngo-exchange/contracts/SerializableMigration.sol)=
7b732ddc3d67ea982b0bb899bd3b25aeda83a9fd
SHA1(dinngo-exchange/contracts/SerializableOrder.sol)=
11b1987bbb1f6e190daa9fe3725a5b728510fb92
SHA1(dinngo-exchange/contracts/SerializableTransferral.sol)=
9e5b3a030380a692a18d70fc1b9003ffb25d936a
SHA1(dinngo-exchange/contracts/SerializableWithdrawal.sol)=
34e90007c8b061d3a55b50027e65c72c6ef87357
SHA1(dinngo-exchange/contracts/migratable/Migratable.sol)=
1ee303a191f0e08d79b07e1c25d383978b648898
SHA1(dinngo-exchange/contracts/proxy/Proxy.sol)=
7986c2b4cce157a00b32eeb3b9e09a722e8c303d
SHA1(dinngo-exchange/contracts/sign/ISign.sol)=
f8e262e7ff62114e86845fd87db79f8671c8540d
```

Source codes in `contracts/mocks`, `contracts/examples`, and `contracts/Migrations.sol` were NOT analyzed.

## <a id="heading-3.2"> 3.2 Analysis Tools

### <a id="heading-3.2.1"> 3.2.1 Surya
Surya is an utility tool for smart contract systems, offering a number of visual outputs and information about the contracts' structure. Also supports querying the function call graph.

### <a id="heading-3.2.2"> 3.2.2 Solhint
Linters improve code quality by enforcing rules for style and composition, making code easier to read and review. Solhint is a linter for Solidity that provides both Security and Style Guide validations.

### <a id="heading-3.2.3"> 3.2.3 Mythril-classic
Mythril-classic is a powerful tool that combines multiple verification functions. It uses symbolic analysis, taint analysis and control flow checking to detect a variety of security vulnerabilities.

### <a id="heading-3.2.4"> 3.2.4 SmartCheck
SmartCheck is an extensible static analysis tool for discovering vulnerabilities and other code issues in Ethereum smart contracts written in the Solidity programming language.

### <a id="heading-3.2.5"> 3.2.5 Slither
Slither is a Solidity static analysis framework written in Python 3. It runs a suite of vulnerability detectors, prints visual information about contract details, and provides an API to easily write custom analyses. Slither enables developers to find vulnerabilities, enhance their code comprehension, and quickly prototype custom analyses.


## <a id="heading-3.3"/> 3.3 Contracts

`SafeMath` and `Byteslib `provides basic utility functionality used throughout the code. 

`Ownable` provides a owner role to ensure the authority of specific functions. `Administrable` provides an additional role in contract which is similar to owner.

`Proxy` provides a proxy interface that enables the function call can be performed by the behaviour defined in an implementation contract.

`Migratable` provides an interface for the new contract when the data needs to be migrated to the new service. Migration requires user's permission.

`SerializableMigration`, `SerializableOrder`, `SerializableTransferral` and `SerializableWithdrawal` define the migration, the order, the transferral and the withdrawal handler by specifying the location within a `bytes` variable.

'ISign' defines the verification module to execute an acknowledged request from another contract.

`DinngoProxy` defines a proxy contract that enables a delegate structure to upgrade the exchange contract by switching the implementation contract. Upgrading the contract requires a certain announcement period. New implementation can only be activated manually after that.

`Dinngo` defines the execution logic that is corresponding to `DinngoProxy`. The core functionality including the user/token management, user balance management and trading settlement are implemented.


# <a id="heading-4"/> 4 - Analysis findings

The tests are generally well written and complete, covering both happy paths and a wide range of exceptions and edge cases. Tests are easy to read and follow. Project building and testing can be easily performed through npm scripts.

## <a id="heading-4.1"/> 4.1 Contract control flow
Dinngo exchange is combined by two contracts, `DinngoProxy` and `Dinngo`. `DinngoProxy` is the proxy contract, which holds the data and authority management. `Dinngo` is the implementation contract, which defines the execution logic. 

### <a id="heading-4.1.1"/> 4.2.1 DinngoProxy
![Alt text](./img/DinngoProxy_flow.png)

### <a id="heading-4.1.2"/> 4.1.2 Dinngo
![Alt text](./img/Dinngo_flow.png)

## <a id="heading-4.2"/> 4.2 Contract inheritance

### <a id="heading-4.2.1"/> 4.2.1 DinngoProxy
`DinngoProxy` inheritates `Ownable`, `Administrable` and `Proxy` to manage the authority and upgradibility.


![Alt text](./img/DinngoProxy_inheritance.png)


### <a id="heading-4.2.2"/> 4.2.2 Dinngo
`Dinngo` inheritates `SerializeMigration`, `SerializableOrder`, `SerializableTransferral` and `SerializableWithdrawal` to handle the serialized data structure.

![Alt text](./img/Dinngo_inheritance.png)

## <a id="heading-4.3"/> 4.3 Smart Contract Weakness Classification
Except static and dynamic tests performed by [Mythril-classic](#heading-3.2.3), [SmartCheck](#heading-3.2.4) and [Slither](#heading-3.2.5), the entire project is well reviewed through [Smart Contract Weakness Classification](https://smartcontractsecurity.github.io/SWC-registry/). The contract contents are free from the listed issues.

### <a id="heading-4.3.1"/> 4.3.1 Number of Issues
|          | LOW | MEDIUM | HIGH | CRITICAL |
|:---------|:---:|:------:|:----:|:--------:|
| Open     |  2  |    0   |   1  |     0    |
| Resolved |  0  |    0   |   0  |     0    |
| Closed   |  0  |    2   |   2  |     0    |

### <a id="heading-4.3.2"/> 4.3.2 Issues by Level
| Location | Issue Title                     | Status | Severity |
|--------|---------------------------------|--------|----------|
| Dinngo | Uninitialized storage variables | Closed   | High     |
| DinngoProxy | Locked money | Closed   | High     |
| Dinngo | Could potentially lead to re-entrancy vulnerability | Open   | High     |
| Dinngo | Functions declared as constant/pure/view changing the state or using assembly code | Closed | Medium |
| Proxy | Functions declared as constant/pure/view changing the state or using assembly code | Closed | Medium |
| Dinngo | Redundant fallback function | Open | Low |
| DinngoProxy | Redundant fallback function | Open | Low |

### <a id="heading-4.3.3"/> 4.3.3 Issue Details
* Dinngo
    * High
        * **[Closed]** Uninitialized storage variables (Dinngo.sol#48)  
Contract *Dinngo* is the implementation of execution logic. Which means that the function should not be directly called. The storage parameters is just for alignment with the calling proxy contract.
        * **[Open]** Re-entrancy vulnerability (Dinngo.sol#377-414)  
The design pattern in function could potentially lead to re-entrancy vulnerability. This might happens when verifying if the transferral is acknowledged by a contract, though the function can only be called by admin.
    * Medium
        * **[Closed]** Function declared as pure using assembly code (Dinngo.sol#566-591)  
Functions that do not read from the state of modify it can be declared as pure. Assembly codes can potentially break this rule. However, the assembly here simple separate and verifies the signature. This does not encounter the described situation.
    * Low
        * **[Open]** Redundant fallback function (Dinngo.sol#96-98)  
The payment rejection fallback is redundant. Starting from Solidity 0.4.0, contracts without a fallback function automatically revert payments.
* DinngoProxy
    * High
        * **[Closed]** Locked money (DinngoProxy.sol#14-369)  
Contracts programmed to receive ether should implement a way to withdraw it. *DinngoProxy* is a proxy contract. The withdrawing function is implemented in *Dinngo* to be called by through `withdraw()` and `withdrawByAdmin()`.
    * Low
        * **[Open]** Redundant fallbock function (DinngoProxy.sol#56-58)  
The payment rejection fallback is redundant. Starting from Solidity 0.4.0, contracts without a fallback function automatically revert payments.
* Proxy
    * Medium
        * **[Closed]** Function declared as view using assembly code (proxy/Proxy.sol#40-49, proxy/Proxy.sol#69-75)  
Functions that do not modify the state can be declared as view. Assembly codes can potentially break this rule. However, the codes mentioned here only performs static call and and reading a specific implementation address. This does not encounter the described solution.

# <a id="heading-5"> 5 - Summary
In conclusion, Dinngo proposed a reliable structure to guarantee user's control of personal asset, while providing other important elements at the same time, such as comfortable trading experience and meeting the compliance needs. Also, the code is revised and free from the known issues discovered from the verifications above.

# <a id="heading-d"> Disclaimer
*This analysis is not a security warranty nor does it provide a security guarantee of the smart contracts. DINNGO Pte. Ltd. disclaims any liability for damage arising out of, or in connection with, this analysis. Copyright of this analysis remains with DINNGO Pte. Ltd.*
