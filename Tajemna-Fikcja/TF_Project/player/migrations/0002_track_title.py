# Generated by Django 5.0.6 on 2024-05-24 09:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('player', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='track',
            name='title',
            field=models.TextField(blank=True, max_length=50),
        ),
    ]
