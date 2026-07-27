"""
Management command to set up admin user with proper role.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Set up admin user with proper role and password'

    def handle(self, *args, **options):
        try:
            user = User.objects.get(username='admin')
            user.role = 'admin'
            user.set_password('admin123')
            user.is_staff = True
            user.is_superuser = True
            user.first_name = 'Admin'
            user.last_name = 'User'
            user.save()
            self.stdout.write(self.style.SUCCESS(
                'Successfully set up admin user\n'
                'Username: admin\n'
                'Password: admin123\n'
                'Role: admin'
            ))
        except User.DoesNotExist:
            user = User.objects.create_superuser(
                username='admin',
                email='admin@multimart.com',
                password='admin123',
                role='admin',
                first_name='Admin',
                last_name='User'
            )
            self.stdout.write(self.style.SUCCESS(
                'Successfully created admin user\n'
                'Username: admin\n'
                'Password: admin123\n'
                'Role: admin'
            ))
