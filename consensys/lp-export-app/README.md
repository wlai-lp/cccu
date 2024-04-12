# cons-lp-export-app

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.1.1. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.


cron job reference

* * * * *
- - - - -
| | | | |
| | | | +-- Day of the week (0 - 7) (Sunday = 0 or 7)
| | | +---- Month (1 - 12)
| | +------ Day of the month (1 - 31)
| +-------- Hour (0 - 23)
+---------- Minute (0 - 59)

# Summary
This app creates a cron job that pulls LP historical data 
saves to the destination
export the image