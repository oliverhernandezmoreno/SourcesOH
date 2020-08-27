tranque-config
==============

Container configuration and orchestration for the tranque project.

The devops checklist
--------------------

We should aim to achieve the following principles and features in our
stack definitions:
1. [x] **Infrastructure** for each possible stack configuration should be
   declared **as code**, requiring very little (if any) previous
   manual actions for its provisioning.
2. [x] **Configuration** for each possible stack variant should be
   declared **as code**, requiring very little (if any) previous
   manual actions for its execution.
3. [x] Each stack should be instrumented with **metrics collection**, and
   they should be made available via easy-to-consume visualizations.
4. [x] Each stack should have the capacity of **self-healing** in the face
   of container failure and even node failure.
5. [ ] Each stack should conform to **horizontal, elastic, metrics-based
   scaling**, in which the stack grows or shrinks according to
   external demands, which are detected through metrics.
6. [ ] Each stack should **secure its volumes and communication channels**
   via appropriate usage of encryption.
7. [ ] Provisioning, configuration and orchestration should be based on
   **current, community-backed open-source software**.
8. [x] Each stack should be **deployable with a single command**, which
   should chain idempotent infrastructure provisioning, idempotent
   configuration and deployment.
9. [x] Each stack should perform its own **periodic logical backups**,
   which should not replace physical backups achieved through the
   cloud provider.
10. [x] Each stack should be **restorable from logical backups** in a
    single (or few) commands.
