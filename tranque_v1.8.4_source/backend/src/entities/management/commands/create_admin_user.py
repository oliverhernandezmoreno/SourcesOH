"""
Management utility to create admin users.
"""
import getpass
import sys

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.contrib.auth.password_validation import validate_password
from django.core import exceptions
from django.core.management.base import BaseCommand, CommandError
from django.utils.text import capfirst

PASSWORD_FIELD = 'password'


# Adapted from create super user command
class Command(BaseCommand):
    help = 'Used to create an admin user.'
    requires_migrations_checks = True
    stealth_options = ('stdin',)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.UserModel = get_user_model()
        self.username_field = self.UserModel._meta.get_field(self.UserModel.USERNAME_FIELD)

    def add_arguments(self, parser):
        parser.add_argument(
            '--%s' % self.UserModel.USERNAME_FIELD,
            help='Specifies the login for the admin user.',
        )
        for field in self.UserModel.REQUIRED_FIELDS:
            parser.add_argument(
                '--%s' % field,
                help='Specifies the %s for the admin user.' % field,
            )

    def get_username(self, _username, verbose_field_name):
        username = _username
        if username:
            error_msg = self._validate_username(username, verbose_field_name)
            if error_msg:
                self.stderr.write(error_msg)
                username = None
        elif username == '':
            raise CommandError('%s cannot be blank.' % capfirst(verbose_field_name))
        # Prompt for username.
        while username is None:
            message = self._get_input_message(self.username_field)
            username = self.get_input_data(self.username_field, message)
            if username:
                error_msg = self._validate_username(username, verbose_field_name)
                if error_msg:
                    self.stderr.write(error_msg)
                    username = None
                    continue
        return username

    def promp_for_fields(self, user_data, options, fake_user_data):
        # Prompt for required fields.
        for field_name in self.UserModel.REQUIRED_FIELDS:
            field = self.UserModel._meta.get_field(field_name)
            user_data[field_name] = options[field_name]
            while user_data[field_name] is None:
                message = self._get_input_message(field)
                input_value = self.get_input_data(field, message)
                user_data[field_name] = input_value
                fake_user_data[field_name] = input_value

                # Wrap any foreign keys in fake model instances
                if field.remote_field:
                    fake_user_data[field_name] = field.remote_field.model(input_value)

    def get_password(self, fake_user_data):
        password = getpass.getpass()
        password2 = getpass.getpass('Password (again): ')
        if password != password2:
            self.stderr.write("Error: Your passwords didn't match.")
            # Don't validate passwords that don't match.
            return None
        if password.strip() == '':
            self.stderr.write("Error: Blank passwords aren't allowed.")
            # Don't validate blank passwords.
            return None
        try:
            validate_password(password2, self.UserModel(**fake_user_data))
        except exceptions.ValidationError as err:
            self.stderr.write('\n'.join(err.messages))
            response = input('Bypass password validation and create user anyway? [y/N]: ')
            if response.lower() != 'y':
                return None
        return password

    def handle(self, *args, **options):
        username = options[self.UserModel.USERNAME_FIELD]
        user_data = {PASSWORD_FIELD: None}
        verbose_field_name = self.username_field.verbose_name
        try:
            # Same as user_data but with foreign keys as fake model
            # instances instead of raw IDs.
            fake_user_data = {}
            username = self.get_username(username, verbose_field_name)
            user_data[self.UserModel.USERNAME_FIELD] = username
            fake_user_data[self.UserModel.USERNAME_FIELD] = (
                self.username_field.remote_field.model(username)
                if self.username_field.remote_field else username
            )
            self.promp_for_fields(user_data, options, fake_user_data)
            # Prompt for a password if the model has one.
            while PASSWORD_FIELD in user_data and user_data[PASSWORD_FIELD] is None:
                user_data[PASSWORD_FIELD] = self.get_password(fake_user_data)
            admin_user = self.UserModel._default_manager.db_manager().create_user(**user_data)
            admin_user.is_staff = True
            admin_user.save()
            admin_user.groups.add(Group.objects.get(name='admin'))

            if options['verbosity'] >= 1:
                self.stdout.write(f'Admin user {admin_user.username} created successfully.')
        except KeyboardInterrupt:
            self.stderr.write('\nOperation cancelled.')
            sys.exit(1)
        except exceptions.ValidationError as e:
            raise CommandError('; '.join(e.messages))

    def get_input_data(self, field, message, default=None):
        """
        Override this method if you want to customize data inputs or
        validation exceptions.
        """
        raw_value = input(message)
        if default and raw_value == '':
            raw_value = default
        try:
            val = field.clean(raw_value, None)
        except exceptions.ValidationError as e:
            self.stderr.write("Error: %s" % '; '.join(e.messages))
            val = None

        return val

    def _get_input_message(self, field):
        return '%s%s: ' % (
            capfirst(field.verbose_name),
            ' (%s.%s)' % (
                field.remote_field.model._meta.object_name,
                field.remote_field.field_name,
            ) if field.remote_field else '',
        )

    def _validate_username(self, username, verbose_field_name):
        """Validate username. If invalid, return a string error message."""
        if self.username_field.unique:
            try:
                self.UserModel._default_manager.db_manager().get_by_natural_key(username)
            except self.UserModel.DoesNotExist:
                pass
            else:
                return 'Error: That %s is already taken.' % verbose_field_name
        if not username:
            return '%s cannot be blank.' % capfirst(verbose_field_name)
        try:
            self.username_field.clean(username, None)
        except exceptions.ValidationError as e:
            return '; '.join(e.messages)
