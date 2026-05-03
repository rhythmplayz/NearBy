from django.apps import AppConfig
import sys

class AdminsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'admins'

    def ready(self):

        if 'runserver' in sys.argv:
            from .models import Admin
            try:

                if not Admin.objects.filter(username='admin').exists():
                    print("--- Initializing Default Admin ---")
                    admin_user = Admin.objects.create(
                        username='admin',
                        email='admin@nearby.com',
                        full_name='System Administrator',
                        user_type='admin',
                        status='active',
                        is_staff=True,
                        is_superuser=True
                    )
                    admin_user.set_password('admin123')
                    admin_user.save()
                    print("Successfully Created: admin / admin123")
                else:
                    print("--- Admin Account Verified ---")
            except Exception as e:
                print(f"Admin check skipped: {e}")