# working_bot

A bot that works for me because i'm lazy

## How does it works

This self bot sends `/works` every x hour to the Ouranos server (`bots-commandes` channel ID:`905426507021811772`)

## Database

- **id** : Account id (serial)


- **money** : Global earnings


- **money_mean** : Average earnings per day


- **total_days_count** : Online days count


- **total_count** : Global amount of successful requests


- **count** : Successful requests of the day


- **count_mean** : Average number of successful requests per day


- **error** : Total error count

## Modifications log

#### 20/08/2022

- [x] Added a database with statistic (PostgresSQL) :

#### 21/08/2022

- [x] Multiple account support for money laundering.
- [x] Added auto-pay function to the main account.
- [x] Added the fetch function to get the salary amount and calculate the global earnings.