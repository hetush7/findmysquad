# Generated by Django 3.2.9 on 2021-11-13 17:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('fms', '0009_delete_currentuser'),
    ]

    operations = [
        migrations.AddField(
            model_name='profilebio',
            name='img_url',
            field=models.URLField(default='IMAGE_URL'),
        ),
    ]
