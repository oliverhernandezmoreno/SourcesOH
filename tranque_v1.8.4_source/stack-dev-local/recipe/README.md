# Snapshot recipe

This folder contains instructions to create a functional development
snapshot. The script `run.sh` should be able to initiate all processes
needed to achieve a good-enough snapshot, though the processes
themselves might take a while to complete.

**Note:** A snapshot built from this recipe is probably already
available at [the snapshots
folder](https://drive.google.com/drive/u/0/folders/1p92WQUeuJslO0woAdu7nExR71lRNzMCQ). Consider
these instructions as a means of adjusting and building another
different snapshot.

Here's a basic explanation of what `run.sh` does:

## 1. Prepare the database

This includes the typical `migrate` and fixture loads. There's several
of those.

## 2. Load users

Loads a couple of users according to the profiles file in this folder:
`profiles.yml`.

## 3. Configure the default target for EF and EMAC

Executes the index installation steps:
1. configure target inventory
2. apply the EF manifest
3. adjust EF timeseries

## 4. Load pseudo-random static data

Using [fake-beats](https://gitlab.com/Inria-Chile/tranque/fake-beats)
and a bunch of simulator behaviours found in behaviour files in the
`faking-behaviours` folder, produce random series data for EF
variables (and a few EMAC variables), then load said data via
enrichment's _bulksave_ command.

## 5. Launch EMAC calculations

Using an ETL operation, load the inputs required by the EMAC indices
to produce results. This calculation is time-consuming.

## 6. Save a snapshot

This isn't run by the `run.sh` script but should be run manually by
you after the calculations run to completion. Produce the snapshot and
share it through the [the snapshots
folder](https://drive.google.com/drive/u/0/folders/1p92WQUeuJslO0woAdu7nExR71lRNzMCQ):

```bash
docker-compose -f docker-compose.yml \
               -f docker-compose.archivist.yml \
               run --rm archivist \
               archivist backup
```
