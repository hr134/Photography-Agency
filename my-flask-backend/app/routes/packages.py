from flask import Blueprint, jsonify
from app.models.package import Package

packages_bp = Blueprint('packages', __name__)

@packages_bp.route('/', methods=['GET'])
def get_packages():
    packages = Package.query.all()
    return jsonify([p.to_dict() for p in packages]), 200
