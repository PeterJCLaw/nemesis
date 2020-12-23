# Nemesis

[![CircleCI](https://circleci.com/gh/srobo/nemesis.svg?style=svg)](https://circleci.com/gh/srobo/nemesis)

This is Nemesis, a system for allowing team leaders running teams for the
[Student Robotics](https://studentrobotics.org) (SR) competition to administrate
the user accounts of the team (including their own).

## Contributing

Please file issues using the [GitHub issues](https://github.com/srobo/nemesis/issues)
for the [canonical repo](https://github.com/srobo/nemesis).

For actual changes, please make pull requests on GitHub against the srobo fork
and ping [@PeterJCLaw](https://github.com/PeterJCLaw) for review.

## Development on a clone of the deployment server

1. Get an srobo dev server from https://github.com/srobo/server-puppet/
2. You've got nemesis in `/srv/nemesis`
3. Run the current set of valid tests using the `./run-tests` script.
4. There are some obsolete javascript client tests in `test/client-tests`.
   In theory, the dependencies could be installed with `./get-dependencies.sh`,
   see the readme in the same directory to run the tests.

Once you've greenlit all the tests, make some changes, go wild!

## Development server (recommended)

In this mode you can either:

 * use a clone of the development server as the LDAP host (see instructions
   above) and then port-forward access to the LDAP server it has, or
 * grab a copy of the SR [development LDAP docker image][sr-dev-ldap]:

   `docker pull peterjclaw/sr-dev-ldap`

   then

   `docker run --rm --publish 3890:389 --name sr-dev-ldap peterjclaw/sr-dev-ldap`

To run the server locally you'll need to install:

 * Sqlite 3
 * Python 2.7
 * `flask`
 * `python-ldap`
 * `unidecode`
 * `python-nose` (for running the tests)

Configuring the LDAP server to use is done by adding a `local.ini` within the
within the `srusers` submodule of the `libnemesis` submodule.

There's then a development mode server which you can run:

    python nemesis/app.py

which shows stack traces when things go wrong, and will auto-reload when you make code changes.

You'll also need to create the sqlite DB manually, which can be done using:

    ./nemesis/scripts/make_db.sh

Note that this will only create the DB if it's missing, and not update it or remove it.
As a result, if the schema changes the DB must be manually removed & re-created.

[sr-dev-ldap]: https://hub.docker.com/r/peterjclaw/sr-dev-ldap
